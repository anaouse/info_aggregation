改好了，两处改动都在 `music-album-item.css` 的 `.music-album-name` 中：

1. **单行 → 两行**：`white-space: nowrap` 替换为 `-webkit-line-clamp: 2` + `-webkit-box-orient: vertical`，专辑名最多显示两行，超出才用省略号。
2. **字号 16px → 18px**：视觉更突出，和卡片比例更协调。

短名字不受影响，长名字能完整展示两行，卡片垂直空间利用也更充分了。