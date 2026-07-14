package main

import (
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
)

// MusicScanRequest is the request body for scanning a music root directory.
type MusicScanRequest struct {
	RootPath string `json:"rootPath"`
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
	Songs      []MusicSong `json:"songs"`
}

var musicExtensions = map[string]bool{
	".mp3":  true,
	".m4a":  true,
	".aac":  true,
	".ogg":  true,
	".wav":  true,
	".flac": true,
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
		albumEntries, err := os.ReadDir(folderPath)
		if err != nil {
			continue
		}

		songs := make([]MusicSong, 0)
		for _, albumEntry := range albumEntries {
			if albumEntry.IsDir() {
				continue
			}
			if !musicExtensions[strings.ToLower(filepath.Ext(albumEntry.Name()))] {
				continue
			}
			songs = append(songs, MusicSong{
				Name: albumEntry.Name(),
				Path: filepath.Join(folderPath, albumEntry.Name()),
			})
		}

		sort.Slice(songs, func(i, j int) bool {
			return songs[i].Name < songs[j].Name
		})

		albums = append(albums, MusicAlbum{
			Name:       entry.Name(),
			FolderPath: folderPath,
			Songs:      songs,
		})
	}

	sort.Slice(albums, func(i, j int) bool {
		return albums[i].Name < albums[j].Name
	})

	return albums, nil
}

// registerMusicRoutes wires up music directory scanning and audio serving endpoints.
func registerMusicRoutes(r *gin.Engine) {
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
		c.File(path)
	})
}
