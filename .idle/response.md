全部改动已完成且一致。总结一下所有修改：

---

### ✅ 改动清单

| 文件 | 操作 |
|------|------|
| `info_aggregation_backend/anime.go` | 新增 `subtitleExtensions` 集合 + 2 个路由 (`/api/anime/subtitles` 和 `/api/anime/subtitle`) |
| `src/types.ts` | 新增 `SubtitleFile` 和 `SubtitlesResponse` 类型 |
| `src/components/SubtitleSelector.tsx` | **新建** — 模仿 `EpisodeSelector` 的字幕选择面板 |
| `src/css/subtitle-selector.css` | **新建** — 字幕选择器样式 |
| `src/components/CustomVideoPlayer.tsx` | 新增 `subtitles`/`onSubtitleSelect` props + "字幕"按钮 + `SubtitleSelector` 渲染 |
| `src/pages/AnimePlayPage.tsx` | `Promise.all` 并行获取视频和字幕列表 + `handleSubtitleSelect` 回调（暂 log 内容） |
| `src/main.tsx` | 引入 `subtitle-selector.css` |

### 🔄 数据流

```
页面加载 → Promise.all 并行请求 videos + subtitles
播放视频 → 控制栏出现 "选集" + "字幕" 两个按钮
点击字幕 → SubtitleSelector 弹出 → 选择字幕后 GET /api/anime/subtitle → console.log 内容
```

air 热重载应该能自动编译后端和前端，直接刷新页面就能看到"字幕"按钮了。