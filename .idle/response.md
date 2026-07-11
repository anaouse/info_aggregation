一切就绪。总结本轮改动：

---

### ✅ 改动清单

| 文件 | 改动 |
|------|------|
| `src/pages/AnimePlayPage.tsx` | 新增 `activeSubtitlePath` + `subtitleContent` state；`handleSubtitleSelect` 改为 toggle 逻辑（同路径→关闭，新路径→fetch 并渲染）；传递新 props |
| `src/components/CustomVideoPlayer.tsx` | 新增 `subtitleContent`/`activeSubtitlePath` props；引入 `assjs`；新增 `subtitleContainerRef`/`assRef`；新增 ASS 渲染 `useEffect`；JSX 中加入字幕层 `<div>`；传递 `activePath` 给 `SubtitleSelector` |
| `src/components/SubtitleSelector.tsx` | 新增 `activePath` prop；选中项添加 `.active` class |
| `src/css/subtitle-selector.css` | 新增 `.subtitle-selector-item.active` 系列高亮样式 |
| `src/css/custom-video-player.css` | 新增 `.custom-video-player-subtitle-layer` 字幕层样式 |

### 🔄 交互流程

```
选字幕A → ASS 渲染到视频上 → 字幕A 在列表中高亮
再次点字幕A → ASS 销毁，字幕消失 → 无高亮
切换到字幕B → ASS 重建，渲染字幕B → 字幕B 高亮
```

去页面上试试吧！