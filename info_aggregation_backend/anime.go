package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
)

// AnimeInfo represents a single anime folder scanned from the root path.
type AnimeInfo struct {
	Name       string `json:"name"`
	FolderPath string `json:"folder_path"`
	CoverPath  string `json:"cover_path"`
	VideoCount int    `json:"video_count"`
}

// AnimeScanRequest is the request body for scanning an anime root directory.
type AnimeScanRequest struct {
	RootPath string `json:"rootPath"`
}

// VideoFile represents a single video file found inside an anime folder.
type VideoFile struct {
	Name    string `json:"name"`
	Path    string `json:"path"`
	Size    int64  `json:"size"`
	ModTime int64  `json:"-"` // Unix timestamp for sorting, not exposed to frontend
}

var videoExtensions = map[string]bool{
	".mp4":  true,
	".mkv":  true,
	".avi":  true,
	".flv":  true,
	".mov":  true,
}

var coverExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
}

var subtitleExtensions = map[string]bool{
	".ass": true,
	".srt": true,
	".vtt": true,
	".ssa": true,
	".sub": true,
}

// scanAnimeRoot walks each top-level directory under rootPath and builds
// an AnimeInfo for it: first image found is used as the cover, video files
// are counted (recursively, since videos may sit in a nested subfolder).
func scanAnimeRoot(rootPath string) ([]AnimeInfo, error) {
	entries, err := os.ReadDir(rootPath)
	if err != nil {
		return nil, err
	}

	animes := make([]AnimeInfo, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		folderPath := filepath.Join(rootPath, entry.Name())
		info := AnimeInfo{
			Name:       entry.Name(),
			FolderPath: folderPath,
		}

		videoCount := 0
		coverFound := false

		filepath.WalkDir(folderPath, func(path string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return nil
			}
			ext := strings.ToLower(filepath.Ext(d.Name()))
			if videoExtensions[ext] {
				videoCount++
			} else if !coverFound && coverExtensions[ext] {
				info.CoverPath = path
				coverFound = true
			}
			return nil
		})

		info.VideoCount = videoCount
		animes = append(animes, info)
	}

	return animes, nil
}

// scanVideosInFolder recursively finds all video files in the given folder.
func scanVideosInFolder(folderPath string) ([]VideoFile, error) {
	var videos []VideoFile

	err := filepath.WalkDir(folderPath, func(path string, d os.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return nil
		}
		ext := strings.ToLower(filepath.Ext(d.Name()))
		if videoExtensions[ext] {
			info, err := d.Info()
			if err != nil {
				return nil
			}
			videos = append(videos, VideoFile{
				Name:    d.Name(),
				Path:    path,
				Size:    info.Size(),
				ModTime: info.ModTime().Unix(),
			})
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	// Sort by creation/modification time (earliest first)
	sort.Slice(videos, func(i, j int) bool {
		return videos[i].ModTime < videos[j].ModTime
	})

	return videos, nil
}

// registerAnimeRoutes wires up the anime scanning and cover-serving endpoints.
func registerAnimeRoutes(r *gin.Engine) {
	// POST /api/anime/scan - scan the given root directory for anime folders
	r.POST("/api/anime/scan", func(c *gin.Context) {
		var req AnimeScanRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误", "detail": err.Error()})
			return
		}
		if req.RootPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "rootPath 不能为空"})
			return
		}
		
		log.Printf("Received scan request: rootPath=%s", req.RootPath)

		stat, err := os.Stat(req.RootPath)
		if err != nil || !stat.IsDir() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}

		animes, err := scanAnimeRoot(req.RootPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"animes": animes})
	})

	// GET /api/anime/videos?folderPath=xxx - list all video files in a folder
	r.GET("/api/anime/videos", func(c *gin.Context) {
		folderPath := c.Query("folderPath")
		if folderPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "folderPath 不能为空"})
			return
		}

		stat, err := os.Stat(folderPath)
		if err != nil || !stat.IsDir() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}

		videos, err := scanVideosInFolder(folderPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"videos": videos})
	})

	// GET /api/anime/video?path=xxx - stream a single video file (supports Range)
	r.GET("/api/anime/video", func(c *gin.Context) {
		path := c.Query("path")
		if path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "path 不能为空"})
			return
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !videoExtensions[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的视频格式"})
			return
		}

		if _, err := os.Stat(path); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "文件不存在"})
			return
		}

		c.File(path)
	})

	// GET /api/anime/cover?path=xxx - serve a cover image file by absolute path
	r.GET("/api/anime/cover", func(c *gin.Context) {
		path := c.Query("path")
		if path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "path 不能为空"})
			return
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !coverExtensions[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的图片格式"})
			return
		}

		if _, err := os.Stat(path); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "文件不存在"})
			return
		}

		c.File(path)
	})

	// GET /api/anime/subtitles?folderPath=xxx - list subtitle files in an anime folder (non-recursive)
	r.GET("/api/anime/subtitles", func(c *gin.Context) {
		folderPath := c.Query("folderPath")
		if folderPath == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "folderPath 不能为空"})
			return
		}

		stat, err := os.Stat(folderPath)
		if err != nil || !stat.IsDir() {
			c.JSON(http.StatusBadRequest, gin.H{"error": "路径不存在或不是文件夹"})
			return
		}

		entries, err := os.ReadDir(folderPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		type SubtitleFile struct {
			Name string `json:"name"`
			Path string `json:"path"`
			Size int64  `json:"size"`
		}

		subtitles := make([]SubtitleFile, 0)
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			ext := strings.ToLower(filepath.Ext(entry.Name()))
			if subtitleExtensions[ext] {
				info, err := entry.Info()
				if err != nil {
					continue
				}
				subtitles = append(subtitles, SubtitleFile{
					Name: entry.Name(),
					Path: filepath.Join(folderPath, entry.Name()),
					Size: info.Size(),
				})
			}
		}

		c.JSON(http.StatusOK, gin.H{"subtitles": subtitles})
	})

	// GET /api/anime/subtitle?path=xxx - return the content of a subtitle file
	r.GET("/api/anime/subtitle", func(c *gin.Context) {
		path := c.Query("path")
		if path == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "path 不能为空"})
			return
		}

		ext := strings.ToLower(filepath.Ext(path))
		if !subtitleExtensions[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的字幕格式"})
			return
		}

		if _, err := os.Stat(path); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "文件不存在"})
			return
		}

		data, err := os.ReadFile(path)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{"content": string(data)})
	})
}
