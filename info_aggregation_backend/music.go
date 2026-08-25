package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"github.com/dhowden/tag"
	"github.com/gin-gonic/gin"
)

// MusicScanRequest is the request body for scanning a music root directory.
type MusicScanRequest struct {
	RootPath string `json:"rootPath"`
}

// MusicFavoriteRequest is the request body for adding or removing a favorite song.
type MusicFavoriteRequest struct {
	RootPath string `json:"rootPath"`
	Path     string `json:"path"`
}

// MusicSong represents a music file in an album folder.
type MusicSong struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

// MusicAlbum represents one top-level album folder and its songs.
type MusicAlbum struct {
	Name       string      `json:"name"`
	FolderPath string      `json:"folder_path"`
	CoverPath  string      `json:"cover_path"`
	Songs      []MusicSong `json:"songs"`
}

var musicExtensions = map[string]bool{
	".mp3":  true,
	".m4a":  true,
	".aac":  true,
	".ogg":  true,
	".opus": true,
	".wav":  true,
	".flac": true,
}

var favoriteFileMutex sync.Mutex

func favoriteFilePath(rootPath string) string {
	return filepath.Join(rootPath, "favorite.json")
}

func readFavoritePaths(rootPath string) ([]string, error) {
	data, err := os.ReadFile(favoriteFilePath(rootPath))
	if os.IsNotExist(err) {
		return []string{}, nil
	}
	if err != nil {
		return nil, err
	}

	favorites := make([]string, 0)
	if err := json.Unmarshal(data, &favorites); err != nil {
		return nil, err
	}
	return favorites, nil
}

func writeFavoritePaths(rootPath string, favorites []string) error {
	data, err := json.MarshalIndent(favorites, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(favoriteFilePath(rootPath), data, 0644)
}

func favoriteRelativePath(rootPath string, songPath string) (string, error) {
	relativePath, err := filepath.Rel(rootPath, songPath)
	if err != nil {
		return "", err
	}
	if relativePath == ".." || strings.HasPrefix(relativePath, ".."+string(filepath.Separator)) {
		return "", os.ErrPermission
	}
	return relativePath, nil
}

func validateMusicRoot(rootPath string) error {
	stat, err := os.Stat(rootPath)
	if err != nil {
		return err
	}
	if !stat.IsDir() {
		return os.ErrInvalid
	}
	return nil
}

// listMusicSongs reads the music files directly inside a folder, sorted by name.
func listMusicSongs(folderPath string) []MusicSong {
	entries, err := os.ReadDir(folderPath)
	if err != nil {
		return nil
	}

	songs := make([]MusicSong, 0)
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if !musicExtensions[strings.ToLower(filepath.Ext(entry.Name()))] {
			continue
		}
		songs = append(songs, MusicSong{
			Name: entry.Name(),
			Path: filepath.Join(folderPath, entry.Name()),
		})
	}

	sort.Slice(songs, func(i, j int) bool {
		return songs[i].Name < songs[j].Name
	})

	return songs
}

// scanMusicRoot reads direct child folders as albums and direct files as songs.
func scanMusicRoot(rootPath string) ([]MusicAlbum, error) {
	entries, err := os.ReadDir(rootPath)
	if err != nil {
		return nil, err
	}

	albums := make([]MusicAlbum, 0)
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		folderPath := filepath.Join(rootPath, entry.Name())
		songs := listMusicSongs(folderPath)

		albums = append(albums, MusicAlbum{
			Name:       entry.Name(),
			FolderPath: folderPath,
			CoverPath:  albumCoverCachePath(rootPath, entry.Name()),
			Songs:      songs,
		})
	}

	sort.Slice(albums, func(i, j int) bool {
		return albums[i].Name < albums[j].Name
	})

	return albums, nil
}

var coverImageExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
}

// infoCoverDir returns the folder used to cache extracted album covers.
func infoCoverDir(rootPath string) string {
	return filepath.Join(rootPath, "info_cover")
}

// albumCoverCachePath returns the cached cover file path for an album, or "".
func albumCoverCachePath(rootPath, albumName string) string {
	entries, err := os.ReadDir(infoCoverDir(rootPath))
	if err != nil {
		return ""
	}
	prefix := albumName + "."
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if strings.HasPrefix(name, prefix) && coverImageExtensions[strings.ToLower(filepath.Ext(name))] {
			return filepath.Join(infoCoverDir(rootPath), name)
		}
	}
	return ""
}

// albumNoCoverMarked reports whether the album is already known to have no cover.
func albumNoCoverMarked(rootPath, albumName string) bool {
	_, err := os.Stat(filepath.Join(infoCoverDir(rootPath), albumName+".none"))
	return err == nil
}

// readCover extracts the embedded cover picture from a music file, if any.
func readCover(path string) (*tag.Picture, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	m, err := tag.ReadFrom(f)
	if err != nil {
		return nil, err
	}
	return m.Picture(), nil
}

// normalizeCoverExt maps a picture extension to a safe image extension.
func normalizeCoverExt(pic *tag.Picture) string {
	ext := strings.ToLower(strings.TrimPrefix(pic.Ext, "."))
	if ext == "jpeg" {
		ext = "jpg"
	}
	if ext != "jpg" && ext != "png" {
		ext = "jpg"
	}
	return ext
}

// extractAlbumCover extracts the first embedded cover found among the album's
// songs and writes it into the info_cover cache folder. It returns the written
// file path, or "" when no song has a cover (after marking the album as coverless).
func extractAlbumCover(rootPath, folderPath, albumName string) (string, error) {
	songs := listMusicSongs(folderPath)
	coverDir := infoCoverDir(rootPath)
	if err := os.MkdirAll(coverDir, 0755); err != nil {
		return "", err
	}

	for _, song := range songs {
		pic, err := readCover(song.Path)
		if err != nil || pic == nil || len(pic.Data) == 0 {
			continue
		}

		coverPath := filepath.Join(coverDir, albumName+"."+normalizeCoverExt(pic))
		if err := os.WriteFile(coverPath, pic.Data, 0644); err != nil {
			return "", err
		}
		return coverPath, nil
	}

	if err := os.WriteFile(filepath.Join(coverDir, albumName+".none"), nil, 0644); err != nil {
		return "", err
	}
	return "", nil
}

// registerMusicRoutes wires up music directory scanning and audio serving endpoints.
func registerMusicRoutes(r *gin.Engine) {
	r.GET("/api/music/favorites", func(c *gin.Context) {
		rootPath := c.Query("rootPath")
		if rootPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rootPath 不能为空"})
			return
		}
		if err := validateMusicRoot(rootPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}

		favoriteFileMutex.Lock()
		favorites, err := readFavoritePaths(rootPath)
		favoriteFileMutex.Unlock()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "读取 favorite.json 失败", "detail": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"favorites": favorites})
	})

	r.POST("/api/music/favorites", func(c *gin.Context) {
		var req MusicFavoriteRequest
		if err := c.ShouldBindJSON(&req); err != nil || req.RootPath == "" || req.Path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rootPath 和 path 不能为空"})
			return
		}
		if err := validateMusicRoot(req.RootPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}
		relativePath, err := favoriteRelativePath(req.RootPath, req.Path)
		if err != nil || !musicExtensions[strings.ToLower(filepath.Ext(relativePath))] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "音乐文件不在音乐根目录内或格式不受支持"})
			return
		}
		if stat, err := os.Stat(req.Path); err != nil || stat.IsDir() {
			c.JSON(http.StatusNotFound, gin.H{"error": "音乐文件不存在"})
			return
		}

		favoriteFileMutex.Lock()
		defer favoriteFileMutex.Unlock()
		favorites, err := readFavoritePaths(req.RootPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "读取 favorite.json 失败", "detail": err.Error()})
			return
		}
		for _, favorite := range favorites {
			if filepath.Clean(favorite) == filepath.Clean(relativePath) {
				c.JSON(http.StatusOK, gin.H{"favorites": favorites})
				return
			}
		}
		favorites = append(favorites, relativePath)
		if err := writeFavoritePaths(req.RootPath, favorites); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "写入 favorite.json 失败", "detail": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"favorites": favorites})
	})

	r.DELETE("/api/music/favorites", func(c *gin.Context) {
		var req MusicFavoriteRequest
		if err := c.ShouldBindJSON(&req); err != nil || req.RootPath == "" || req.Path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rootPath 和 path 不能为空"})
			return
		}
		if err := validateMusicRoot(req.RootPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}
		relativePath, err := favoriteRelativePath(req.RootPath, req.Path)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "音乐文件不在音乐根目录内"})
			return
		}

		favoriteFileMutex.Lock()
		defer favoriteFileMutex.Unlock()
		favorites, err := readFavoritePaths(req.RootPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "读取 favorite.json 失败", "detail": err.Error()})
			return
		}
		updatedFavorites := make([]string, 0, len(favorites))
		for _, favorite := range favorites {
			if filepath.Clean(favorite) != filepath.Clean(relativePath) {
				updatedFavorites = append(updatedFavorites, favorite)
			}
		}
		if err := writeFavoritePaths(req.RootPath, updatedFavorites); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "写入 favorite.json 失败", "detail": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"favorites": updatedFavorites})
	})
	r.POST("/api/music/scan", func(c *gin.Context) {
		var req MusicScanRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误", "detail": err.Error()})
			return
		}
		if req.RootPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rootPath 不能为空"})
			return
		}

		stat, err := os.Stat(req.RootPath)
		if err != nil || !stat.IsDir() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}

		albums, err := scanMusicRoot(req.RootPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"albums": albums})
	})

	r.GET("/api/music/cover", func(c *gin.Context) {
		folderPath := c.Query("folderPath")
		if folderPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "folderPath 不能为空"})
			return
		}
		if stat, err := os.Stat(folderPath); err != nil || !stat.IsDir() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "专辑路径不存在或不是文件夹"})
			return
		}

		rootPath := filepath.Dir(folderPath)
		if err := validateMusicRoot(rootPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}

		albumName := filepath.Base(folderPath)

		if coverPath := albumCoverCachePath(rootPath, albumName); coverPath != "" {
			c.File(coverPath)
			return
		}
		if albumNoCoverMarked(rootPath, albumName) {
			c.JSON(http.StatusNotFound, gin.H{"error": "无封面"})
			return
		}

		coverPath, err := extractAlbumCover(rootPath, folderPath, albumName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "提取封面失败", "detail": err.Error()})
			return
		}
		if coverPath == "" {
			c.JSON(http.StatusNotFound, gin.H{"error": "无封面"})
			return
		}
		c.File(coverPath)
	})

	r.GET("/api/music/audio", func(c *gin.Context) {
		path := c.Query("path")
		if path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "path 不能为空"})
			return
		}
		if !musicExtensions[strings.ToLower(filepath.Ext(path))] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的音乐格式"})
			return
		}
		if _, err := os.Stat(path); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "文件不存在"})
			return
		}
		if strings.EqualFold(filepath.Ext(path), ".opus") {
			c.Header("Content-Type", "audio/ogg")
		}
		c.File(path)
	})
}
