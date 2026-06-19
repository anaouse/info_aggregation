package main

import (
	"log"
	"net/http"

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

	// CORS: 允许 localhost:5173 跨域
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
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

	r.Run(":1233")
}
