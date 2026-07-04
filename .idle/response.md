全部完成。改动汇总：

### 后端

| 文件 | 改动 |
|------|------|
| `migrations/migrations.go` | 新增 v5：`ALTER TABLE assets_snapshots ADD COLUMN total REAL`（可空） |
| `main.go` | `AssetSnapshotRequest` / `AssetSnapshot` 加 `Total *float64`；GET/POST 查询和写入 `total` |

### 前端

| 文件 | 改动 |
|------|------|
| `src/types.ts` | `AssetSnapshot` 加 `total: number \| null` |
| `AssetItem.tsx` | placeholder `"金额"` → `"数量"` |
| `AssetsList.tsx` | 新增 `total` state + 输入框；POST 带 `total`；历史表格恢复"总金额"列，`null` 时显示空；点击回填时同步恢复 total |
| `assets-list.css` | 新增 `.assets-list-total` 样式，恢复 `.assets-list-table-total` |