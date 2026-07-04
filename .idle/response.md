完成。改动总结：

| 文件 | 操作 |
|------|------|
| `src/components/TotalMoneyChart.tsx` | **新建** — 自己 GET 数据，过滤 `total != null`，按日期升序绘折线图，空数据显示提示 |
| `src/css/total-money-chart.css` | **新建** — 图表容器样式 |
| `src/pages/AssetsPage.tsx` | 顶部加 `<TotalMoneyChart />`，下方 `<AssetsList />` |
| `src/main.tsx` | 引用 `total-money-chart.css` |

图表只显示有 `total` 的快照点，X 轴 `YYYY-MM`，Y 轴总金额，线色森绿。