# 项目一句话隐性知识

- `main.go` 只负责路由注册，`database.go` 负责数据库初始化与操作，职责分离
- SQLite 使用 `modernc.org/sqlite`，须匿名导入 `_ "modernc.org/sqlite"` 注册驱动，然后用标准库 `database/sql` 操作
- 所有时间统一使用 UTC，存储格式为 ISO 8601（`time.RFC3339`，如 `2024-01-15T08:30:05Z`）
- 数据库结构变更必须通过 `migrations/` 迁移系统，严禁手动改库，否则 `schema_migrations` 表与实际结构不一致会导致迁移系统混乱
- `migrations/migrations.go` 定义迁移列表（Version、Name、Up SQL），`migrations/runner.go` 负责执行并在 `schema_migrations` 表中记录已跑版本，`database.go` 的 `InitDB()` 只需调用 `migrations.Run(db)`
- 数据库文件放在后端的 `./data/info_aggregation.sqlite`
- 前端 HTTP 请求使用 `axios`，API 基址通过 `API_BASE` 常量统一管理
- 我新入门node.js生态，这是一个react/vite，使用tsx编写的信息源聚合工具，我写着来练习react以及typescript
- `@` 别名指向 `./src`，引用时写 `@/foo` 即可，不要写成 `@/src/foo`
- `source.tsx` 只负责单条数据渲染，容器组件 `App.tsx` 负责数据持有和组合
- css 统一放在 `src/css/` 下，然后在 `main.tsx` 中全部引用
- 后端接口统一以 `/api` 为前缀（如 `/api/sources`），方便生产环境 Nginx 反向代理分流前后端请求
- 前端开发端口5173（Vite 默认），后端端口1233，后端使用gin框架，使用air热重载，跨域中间件使用：`github.com/gin-contrib/cors`
