package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Source struct {
	SourceName string `json:"source_name"`
	URL        string `json:"url"`
}

func main() {
	r := gin.Default()

	// CORS: 允许 localhost:5137 跨域
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
		sources := []Source{
			{SourceName: "Hacker News", URL: "https://news.ycombinator.com"},
			{SourceName: "GitHub Trending", URL: "https://github.com/trending"},
			{SourceName: "React Blog", URL: "https://react.dev/blog"},
			{SourceName: "Vite", URL: "https://vitejs.dev"},
			{SourceName: "MDN Web Docs", URL: "https://developer.mozilla.org"},
		}
		c.JSON(http.StatusOK, sources)
	})

	r.Run(":1233")
}
