---
created_at: 2026-08-25T12:49:41+08:00
status: done # done | todo
---

> 人下达task，你执行task并记录执行过程，人验收后记录验收看到的东西判断是否完成，你继续执行task，直到人认为结束了再手动修改status

# 说明

现在关于 Music 这个页面的前端和后端那个专辑展示的时候是不显示图片的，但是有一些专辑当中的歌曲的metainfo是有图片的，或者说thumbnail？我不知道这个术语叫什么，就是mp3文件自带图片

我想先聚焦于 MusicAlbumItem和 MusicAlbumList这个，我希望每个专辑的item可以展示图片（如果有的话）

应该主要是3个问题：

1. MusicAlbumItem的展示方式应该变一下，现在是直接展示专辑名称，不要展示歌曲数了，以及有图片（如果有的话）以及播放专辑的按钮。
2. 关于图片前后端要如何request并回答？我感觉图片肯定很多，那么MusicAlbumList这个做成分页的吧，下方加入下一页上一页这种按钮，然后感觉要加入一种缓存机制？一开始是从专辑的第一首歌曲尝试获取thumbnail图片，如果没有就是没有，如果有了那存储到本地对应的music目录下的cover文件夹？之后申请的时候可以直接获得图片，或者直接反馈没图片？
3. 以及按专辑名称搜索过滤的时候也很麻烦，如果已有图片缓存的那很快，万一没有又要重新请求一次？是不是使用浏览器的缓存indexdb好像是这个会好一点？


总之现在那些音乐播放器对于那么多歌曲都可以展示图片是怎么做到的？先给我方案，我同意了再执行

---

## 执行记录

### 方案确认（用户拍板）
1. 做 `.none` 无图标记
2. 缓存目录取名 `info_cover`（避免和可能存在的 cover 专辑名冲突）
3. 使用 `github.com/dhowden/tag` 读内嵌封面（已 go get）
4. 分页 24 个/页
5. 封面文件名直接用专辑名（文件夹名合法且不重复）

### 后端 `info_aggregation_backend/music.go`
- `MusicAlbum` 增加 `cover_path` 字段。
- 抽 `listMusicSongs`，`scanMusicRoot` 复用；扫描时快速检查 `info_cover` 缓存，命中则填 `cover_path`，不在此提取。
- 新增封面缓存相关函数：`infoCoverDir` / `albumCoverCachePath` / `albumNoCoverMarked` / `readCover` / `normalizeCoverExt` / `extractAlbumCover`。
- 新增 `GET /api/music/cover?folderPath=`：命中缓存图 → 直接返回文件；命中 `.none` → 404；否则按歌曲排序从第一首起提取，成功写 `专辑名.<ext>` 并返回，全部无图则写 `专辑名.none` 并 404。`rootPath` 由 `filepath.Dir(folderPath)` 推导。

### 前端
- `types.ts`：`MusicAlbum` 增加 `cover_path: string`。
- `MusicAlbumItem.tsx`：改为封面（`img` + `onError` 降级到「无封面」占位）+ 专辑名 + 播放按钮，去掉歌曲数。
- `MusicPage.tsx`：加 `page`/`PAGE_SIZE=24` 分页，`filteredAlbums` 切当前页；搜索关键词变化重置到第 0 页；分页按钮（上一页/下一页 + 页码）放专辑 section 下方。
- `music-album-item.css`：封面卡片布局（`aspect-ratio: 1/1`）。
- `music-page.css`：加分页样式。

### 关于 IndexedDB
未采用，靠后端 `info_cover` 落盘缓存 + 浏览器 HTTP 缓存即可，避免过度设计。

### 验证
- 后端 `go build ./...` 通过。
- 前端 `tsc --noEmit` 报的均为项目既有问题（tsconfig 未配 `@` 别名 paths，导致 `@/` 解析失败及连锁 any 类型），非本次改动引入。vite 由 `vite.config.ts` 的 alias 处理，不影响运行。

### 待验收
1. Music 页专辑 item 是否显示封面（有内嵌封面的专辑）。
2. 无封面专辑是否显示占位，且 `info_cover` 下出现 `专辑名.none`。
3. 分页上下页、搜索过滤后回到第 0 页是否正常。

# 验收

顺利通过 info_cover 当中出现了 .none 这样的东西，以及过滤后正常显示封面，item正常显示封面