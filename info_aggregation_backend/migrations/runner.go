package migrations

import (
	"database/sql"
	"fmt"
	"log"
)

func Run(db *sql.DB) error {
	// 确保迁移记录表存在
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		version    INTEGER PRIMARY KEY,
		name       TEXT    NOT NULL,
		applied_at TEXT    NOT NULL DEFAULT (datetime('now'))
	)`)
	if err != nil {
		return fmt.Errorf("创建迁移记录表失败: %w", err)
	}

	for _, m := range All {
		var count int
		err := db.QueryRow(
			"SELECT COUNT(*) FROM schema_migrations WHERE version = ?",
			m.Version,
		).Scan(&count)
		if err != nil {
			return fmt.Errorf("查询迁移状态 v%d 失败: %w", m.Version, err)
		}
		if count > 0 {
			continue
		}

		tx, err := db.Begin()
		if err != nil {
			return fmt.Errorf("开启事务失败 v%d: %w", m.Version, err)
		}

		if _, err := tx.Exec(m.Up); err != nil {
			tx.Rollback()
			return fmt.Errorf("迁移 v%d [%s] 失败: %w", m.Version, m.Name, err)
		}

		if _, err := tx.Exec(
			"INSERT INTO schema_migrations (version, name) VALUES (?, ?)",
			m.Version, m.Name,
		); err != nil {
			tx.Rollback()
			return fmt.Errorf("记录迁移 v%d 失败: %w", m.Version, err)
		}

		if err := tx.Commit(); err != nil {
			return fmt.Errorf("提交事务 v%d 失败: %w", m.Version, err)
		}

		log.Printf("✓ 迁移 v%d: %s", m.Version, m.Name)
	}

	return nil
}
