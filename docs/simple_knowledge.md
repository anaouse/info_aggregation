# 项目一句话隐性知识


- 每个组件都会写一个Props接口，然后在组件函数那里声明类型：export default function SourceItem({ data, onDelete }: SourceItemProps) {...} 方便编译时候直接报错
- React 组件使用 **PascalCase**（如 `SourceItem`、`SourcesList`），一个组件一个 `.tsx` 文件，放在 `src/components/` 下
- CSS 文件使用 **kebab-case**（如 `source-item.css`、`sources-list.css`），一个组件一个 CSS 文件，放在 `src/css/` 下，文件名与组件名对应：`SourceItem.tsx` → `source-item.css`
- CSS 类名使用 **kebab-case**，以组件名缩写或功能名为前缀（如 `.source-item-name`、`.confirm-overlay`），避免全局冲突
- 所有 CSS 文件必须在 `main.tsx` 中统一引用
- 配色**必须使用** `root.css` 中定义的 CSS 变量（`--color-primary-*` 森绿系、`--color-danger-*` 玫瑰红系），严禁硬编码颜色值
- 公共类型定义放在 `src/types.ts`
- `main.go` 只负责路由注册，`database.go` 负责数据库初始化与操作，职责分离
- SQLite 使用 `modernc.org/sqlite`，须匿名导入 `_ "modernc.org/sqlite"` 注册驱动，然后用标准库 `database/sql` 操作
- 所有时间统一使用 UTC，存储格式为 ISO 8601（`time.RFC3339`，如 `2024-01-15T08:30:05Z`）
- 数据库结构变更必须通过 `migrations/` 迁移系统，严禁手动改库，否则 `schema_migrations` 表与实际结构不一致会导致迁移系统混乱
- `migrations/migrations.go` 定义迁移列表（Version、Name、Up SQL），`migrations/runner.go` 负责执行并在 `schema_migrations` 表中记录已跑版本，`database.go` 的 `InitDB()` 只需调用 `migrations.Run(db)`
- 迁移系统只管理数据库结构变更（DDL），启动时按版本顺序执行，跑过即跳过；前端的增删查改操作的是数据行（DML），不触碰 `schema_migrations` 表，两者互不干扰——v2 那种数据修正是一次性补丁，伴随结构变更设置，不是常驻逻辑
- 数据库文件放在后端的 `./data/info_aggregation.sqlite`
- 前端 HTTP 请求使用 `axios`，API 基址通过 `API_BASE` 常量统一管理
- 我新入门node.js生态，这是一个react/vite，使用tsx编写的信息源聚合工具，我写着来练习react以及typescript
- `@` 别名指向 `./src`，引用时写 `@/foo` 即可，不要写成 `@/src/foo`
- `source.tsx` 只负责单条数据渲染，容器组件 `App.tsx` 负责数据持有和组合
- css 统一放在 `src/css/` 下，然后在 `main.tsx` 中全部引用
- 后端接口统一以 `/api` 为前缀（如 `/api/sources`），方便生产环境 Nginx 反向代理分流前后端请求
- 前端开发端口5173（Vite 默认），后端端口1233，后端使用gin框架，使用air热重载，跨域中间件使用：`github.com/gin-contrib/cors`
