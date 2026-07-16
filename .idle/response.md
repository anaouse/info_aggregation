已处理。问题在 `CustomVideoPlayer`：原本静止 3 秒只隐藏了播放器控制栏，没有隐藏鼠标指针。

### 修改内容

- `src/components/CustomVideoPlayer.tsx`
  - 全屏播放时，如果控制栏已经自动隐藏，并且选集/字幕弹窗没有打开，则给播放器添加 `cursor-hidden` 类。
  - 鼠标移动后，控制栏和鼠标指针都会重新显示。

- `src/css/custom-video-player.css`
  - 新增 `cursor: none`，同时覆盖播放器容器和 `<video>` 自身的 `cursor: pointer`。

最终效果：

- 仅在全屏状态下隐藏鼠标。
- 播放过程中静止 3 秒后，控制栏和鼠标一起隐藏。
- 移动鼠标后立即恢复。
- 暂停或打开选集、字幕面板时不会隐藏鼠标。

已执行 `npm run build`，构建通过。只有原有的打包体积警告，没有编译错误。