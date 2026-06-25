package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Source struct {
	SourceName string `json:"source_name"`
	URL        string `json:"url"`
}

func main() {
	// 初始化 SQLite
	db, err := InitDB("./data/info_aggregation.sqlite")
	if err != nil {
		log.Fatalf("数据库初始化失败: %v", err)
	}
	defer db.Close()

	r := gin.Default()

	// CORS: 允许 localhost:5173 4000 跨域
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173","http://localhost:4000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
	}))

	r.GET("/api/get", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "bro, you use get right?",
		})
	})

	r.GET("/api/sources", func(c *gin.Context) {
		rows, err := db.Query("SELECT source_name, url FROM info_sources")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var sources []Source
		for rows.Next() {
			var s Source
			if err := rows.Scan(&s.SourceName, &s.URL); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			sources = append(sources, s)
		}
		c.JSON(http.StatusOK, sources)
	})

	r.POST("/api/sources", func(c *gin.Context) {
		var s Source
		if err := c.ShouldBindJSON(&s); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误"})
			return
		}
		if s.SourceName == "" || s.URL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "source_name 和 url 不能为空"})
			return
		}

		_, err := db.Exec(
			"INSERT INTO info_sources (source_name, url, create_at) VALUES (?, ?, ?)",
			s.SourceName, s.URL, time.Now().UTC().Format(time.RFC3339),
		)
		if err != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "信息源已存在或添加失败"})
			return
		}
		c.JSON(http.StatusCreated, Source{SourceName: s.SourceName, URL: s.URL})
	})

	r.DELETE("/api/sources", func(c *gin.Context) {
		var s Source
		if err := c.ShouldBindJSON(&s); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误"})
			return
		}
		if s.URL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "url 不能为空"})
			return
		}

		result, err := db.Exec("DELETE FROM info_sources WHERE url = ?", s.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		affected, _ := result.RowsAffected()
		if affected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "信息源不存在"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
	})

	r.Run(":1233")
}
