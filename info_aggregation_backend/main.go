package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Source struct {
	SourceName string `json:"source_name"`
	URL        string `json:"url"`
}

type Prediction struct {
	ID        int    `json:"id"`
	Text      string `json:"text"`
	Done      int    `json:"done"`
	UpdatedAt string `json:"updated_at"`
	CreatedAt string `json:"created_at"`
}

type PredictionCreateRequest struct {
	Text string `json:"text"`
}

type PredictionUpdateRequest struct {
	Text *string `json:"text"`
	Done *int    `json:"done"`
}

type AssetItem struct {
	Name   string  `json:"name"`
	Amount float64 `json:"amount"`
}

type AssetSnapshotRequest struct {
	Date  string      `json:"date"`
	Items []AssetItem `json:"assets"`
	Total *float64    `json:"total"`
	Note  *string     `json:"note"`
}

type AssetSnapshot struct {
	ID                 int         `json:"id"`
	AssetsSnapshotDate string      `json:"assets_snapshot_date"`
	Assets             []AssetItem `json:"assets"`
	Total              *float64    `json:"total"`
	Note               *string     `json:"note"`
	CreatedAt          string      `json:"created_at"`
	UpdatedAt          string      `json:"updated_at"`
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

	registerAnimeRoutes(r)
	registerMusicRoutes(r)

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

	// GET /api/predictions - 查所有预言
	r.GET("/api/predictions", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, text, done, updated_at, created_at FROM predictions")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var predictions []Prediction
		for rows.Next() {
			var p Prediction
			if err := rows.Scan(&p.ID, &p.Text, &p.Done, &p.UpdatedAt, &p.CreatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			predictions = append(predictions, p)
		}
		if predictions == nil {
			predictions = []Prediction{}
		}
		c.JSON(http.StatusOK, predictions)
	})

	// POST /api/predictions - 新建预言
	r.POST("/api/predictions", func(c *gin.Context) {
		var req PredictionCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误"})
			return
		}
		if req.Text == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "text 不能为空"})
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)
		result, err := db.Exec(
			"INSERT INTO predictions (text, done, updated_at, created_at) VALUES (?, 0, ?, ?)",
			req.Text, now, now,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		id, _ := result.LastInsertId()
		c.JSON(http.StatusCreated, Prediction{
			ID:        int(id),
			Text:      req.Text,
			Done:      0,
			UpdatedAt: now,
			CreatedAt: now,
		})
	})

	// PUT /api/predictions/:id - 更新预言
	r.PUT("/api/predictions/:id", func(c *gin.Context) {
		id := c.Param("id")

		var req PredictionUpdateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误"})
			return
		}
		if req.Text == nil && req.Done == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "至少提供 text 或 done 其中一个字段"})
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)
		if req.Text != nil && req.Done != nil {
			_, err = db.Exec(
				"UPDATE predictions SET text = ?, done = ?, updated_at = ? WHERE id = ?",
				*req.Text, *req.Done, now, id,
			)
		} else if req.Text != nil {
			_, err = db.Exec(
				"UPDATE predictions SET text = ?, updated_at = ? WHERE id = ?",
				*req.Text, now, id,
			)
		} else {
			_, err = db.Exec(
				"UPDATE predictions SET done = ?, updated_at = ? WHERE id = ?",
				*req.Done, now, id,
			)
		}
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		var p Prediction
		err = db.QueryRow(
			"SELECT id, text, done, updated_at, created_at FROM predictions WHERE id = ?", id,
		).Scan(&p.ID, &p.Text, &p.Done, &p.UpdatedAt, &p.CreatedAt)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "预言不存在"})
			return
		}
		c.JSON(http.StatusOK, p)
	})

	// GET /api/assets_snapshots - 返回所有资产快照
	r.GET("/api/assets_snapshots", func(c *gin.Context) {
		rows, err := db.Query(
			"SELECT id, assets_snapshot_date, assets, total, note, created_at, updated_at FROM assets_snapshots ORDER BY assets_snapshot_date DESC",
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var snapshots []AssetSnapshot
		for rows.Next() {
			var s AssetSnapshot
			var assetsJSON string
			if err := rows.Scan(&s.ID, &s.AssetsSnapshotDate, &assetsJSON, &s.Total, &s.Note, &s.CreatedAt, &s.UpdatedAt); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if err := json.Unmarshal([]byte(assetsJSON), &s.Assets); err != nil {
				s.Assets = []AssetItem{}
			}
			snapshots = append(snapshots, s)
		}
		if snapshots == nil {
			snapshots = []AssetSnapshot{}
		}
		c.JSON(http.StatusOK, snapshots)
	})

	// POST /api/assets_snapshots - 新建或更新某月资产快照
	r.POST("/api/assets_snapshots", func(c *gin.Context) {
		var req AssetSnapshotRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误"})
			return
		}

		// Validate date format: YYYY-MM-01
		if len(req.Date) != 10 || !strings.HasSuffix(req.Date, "-01") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "date 格式必须为 YYYY-MM-01"})
			return
		}
		if _, err := time.Parse("2006-01-02", req.Date); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "date 格式必须为 YYYY-MM-01"})
			return
		}

		// Validate items
		if len(req.Items) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "items 不能为空"})
			return
		}
		nameSet := make(map[string]bool)
		for _, item := range req.Items {
			if item.Name == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "资产名称不能为空"})
				return
			}
			if nameSet[item.Name] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "资产名称不能重复: " + item.Name})
				return
			}
			nameSet[item.Name] = true
		}

		// Marshal items to JSON
		assetsJSON, err := json.Marshal(req.Items)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "序列化资产数据失败"})
			return
		}

		now := time.Now().UTC().Format(time.RFC3339)

		// INSERT ... ON CONFLICT DO UPDATE
		result, err := db.Exec(
			`INSERT INTO assets_snapshots (assets_snapshot_date, assets, total, note, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT(assets_snapshot_date) DO UPDATE SET
			   assets = excluded.assets,
			   total = excluded.total,
			   note = excluded.note,
			   updated_at = excluded.updated_at`,
			req.Date, string(assetsJSON), req.Total, req.Note, now, now,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Determine if it was insert or update
		id, _ := result.LastInsertId()
		rowsAffected, _ := result.RowsAffected()

		// For UPDATE on conflict with SQLite, LastInsertId may not be reliable.
		// Fetch the actual record.
		var snapshot AssetSnapshot
		var assetsStr string
		err = db.QueryRow(
			"SELECT id, assets_snapshot_date, assets, total, note, created_at, updated_at FROM assets_snapshots WHERE assets_snapshot_date = ?",
			req.Date,
		).Scan(&snapshot.ID, &snapshot.AssetsSnapshotDate, &assetsStr, &snapshot.Total, &snapshot.Note, &snapshot.CreatedAt, &snapshot.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		json.Unmarshal([]byte(assetsStr), &snapshot.Assets)

		status := http.StatusCreated
		if rowsAffected > 0 && id == 0 {
			// ON CONFLICT UPDATE typically returns 0 for LastInsertId
			status = http.StatusOK
		}

		c.JSON(status, snapshot)
	})

	r.Run(":1233")
}
