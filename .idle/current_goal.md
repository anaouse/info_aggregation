一个新的Page： AnimePage存放我的本地动漫

看一下 ../anime 就可以知道大概的文件分布

一个文件夹就是一部动漫，然后内部可能视频在文件夹里面，以及会有各集的字幕文件，然后还会有封面可能是png或者jpg

我的page的理想样子：

- header（依然是常驻的）
- 这个是动漫根目录路径输入框（一个输入框，一个按钮，使用localStorage长期存储），输入本地动漫根路径的绝对路径后点击按钮确定，然后后端扫描获取文件排列，每个文件夹是一部动漫，在文件夹动漫当中的第一个jpg或者png图片文件就当作是封面返回给前端？还是说返回文件路径即可展示？
- AnimeList排列展示很多个AnimeItem
- AnimeItem就是显示图片和动漫名称的一个组件
- 先不考虑之后的点击动漫进入播放界面，但是我想问这样的配置之后跳转到播放界面应该不难吧

我的理解：

页面：

AnimePage.tsx

组件：

AnimeList.tsx
AnimeItem.tsx
SetPathBar.tsx

样式：

anime-list.css
anime-item.css
set-path-bar.css

后端新开一个get端口不涉及数据库，只是进行路径扫描

后端和前端数据应该如何设计？然后放到 src/types.ts

你先探索项目然后再看看我的设计有什么问题吗？最后给我你的修改计划
