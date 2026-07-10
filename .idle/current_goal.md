很棒接下来把可播放也做了吧。

我希望点击卡片后进入到一个新的没有header的页面AnimePlayPage我的设计如下：

一个anime header 有个 ⬅️ 按钮意味着点击后回到 AnimePage，然后这个header还展示当前这部动漫的名称

然后header下方是视频区域，黑色大屏的视频播放地方

然后视频播放下方又是一块地区展示这个动漫文件夹当中所有的视频文件，我点击后上方的视频区域就可以开始播放，先不考虑字幕的展示

那么我的设计就是要有

AnimePlayPage.tsx

AnimePlayHeader.tsx
ShowVideo.tsx
ShowFiles.tsx

ShowVideo.css
ShowFiles.css

我的这个设计可行吗？以及需要什么额外的库吗？以及视频播放的时候是直接获取本地视频还是后端进行一段段上传比较好？后续我需要一个额外的组件解析并实时显示字幕，方便我学习日语

想给我你的计划
