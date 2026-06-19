后端创建一个migrations文件夹，用于开发的时候数据库迁移操作，以下是参考代码，我要迁移的时候会自己执行runner.go

// migrations/migrations.go
package migrations

import "database/sql"

type Migration struct {
    Version int
    Name    string
    Up      string
}

var All = []Migration{
    {
        Version: 1,
        Name:    "create_users",
        Up: `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
    },
    {
        Version: 2,
        Name:    "add_email_to_users",
        Up:      `ALTER TABLE users ADD COLUMN email TEXT DEFAULT NULL`,
    },
    {
        Version: 3,
        Name:    "add_phone_nullable",
        Up:      `ALTER TABLE users ADD COLUMN phone TEXT DEFAULT NULL`,
    },
}

// migrations/runner.go
package migrations

import (
    "database/sql"
    "fmt"
    "log"
)

func Run(db *sql.DB) error {
    // 确保迁移记录表存在
    _, err := db.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name    TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)
    if err != nil {
        return fmt.Errorf("创建迁移表失败: %w", err)
    }

    for _, m := range All {
        // 检查这个版本是否已跑过
        var count int
        err := db.QueryRow(
            "SELECT COUNT(*) FROM schema_migrations WHERE version = ?",
            m.Version,
        ).Scan(&count)
        if err != nil {
            return err
        }
        if count > 0 {
            continue // 已跑过，跳过
        }

        // 在事务里执行
        tx, err := db.Begin()
        if err != nil {
            return err
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
            return err
        }

        if err := tx.Commit(); err != nil {
            return err
        }

        log.Printf("✓ 迁移 v%d: %s", m.Version, m.Name)
    }

    return nil
}
