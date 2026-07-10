两个接口现在都能正常响应了，问题已经修复。总结一下根本原因：

**问题 1：视频个数和封面不显示**
根源是前后端字段命名约定不一致。后端 Go 返回的 JSON 是 snake_case（`folder_path`、`cover_path`、`video_count`），但我最初在 `src/types.ts` 里把 `AnimeInfo` 定义成了 camelCase（`folderPath`、`coverPath`、`videoCount`）。TypeScript 编译时不会报错（因为类型只是编译期约束，运行时不校验），但前端实际读到的字段全是 `undefined`，导致封面图不渲染、视频数显示为空。已经把 `types.ts`、`AnimeItem.tsx`、`AnimeList.tsx` 里的字段都改成 snake_case，和后端保持一致。

**问题 2：刷新页面后路径还在但不请求数据**
`SetPathBar` 组件只在 mount 时把 localStorage 里的路径填入输入框，但没有触发扫描；扫描逻辑挂在 `onScan` 回调上，只有点击按钮才会调用。已经在 `AnimePage` 里加了一个 `useEffect`，页面加载时如果 localStorage 有保存的路径就自动调用 `handleScan`。

另外我在排查问题时给 `anime.go` 加了一行 `log.Printf` 调试日志，代码还留着（已经补上了 `log` 包的 import，能正常编译）。这行日志留着方便你以后调试请求参数，如果不需要可以告诉我删掉。

现在你可以刷新页面测试一下：输入路径扫描后应该能看到封面图和正确的视频数，刷新页面后也应该自动重新扫描出结果。