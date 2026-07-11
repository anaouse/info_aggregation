然后我现在希望我选中字幕后可以自动解析ass并且叠加到video上并且顺利自动跟上画面，我在网上找到了好像ass.js可以实现？我已经npm install它了

然后还有一个参考代码，我不确定对不对：

```
import { useEffect, useRef } from 'react';
import ASS from 'assjs';

function VideoWithAss() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const assInstanceRef = useRef(null);

  useEffect(() => {
    const initSubtitles = async () => {
      if (!videoRef.current || !containerRef.current) return;

      try {
        // 1. 加载 ASS 文件内容
        const response = await fetch('/path/to/your-subtitle.ass');
        const assText = await response.text();

        // 2. 创建 ASS 实例
        assInstanceRef.current = new ASS(assText, videoRef.current, {
          container: containerRef.current,   // 必须指定容器
          // 可选配置
          // resample: 'video',              // 或者 'script'
          // delay: 0,                       // 时间偏移（秒）
        });

      } catch (err) {
        console.error('加载字幕失败:', err);
      }
    };

    initSubtitles();

    // 组件卸载时销毁
    return () => {
      if (assInstanceRef.current) {
        assInstanceRef.current.destroy?.();
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <video ref={videoRef} controls width="100%" />
      <div ref={containerRef} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'   // 让点击穿透到 video
      }} />
    </div>
  );
}

export default VideoWithAss;
```

以及我希望可以做到我点击字幕后渲染到视频上，假如我再次点击那个字幕则可以隐藏，相当于现在没有选中字幕一样，先给我你的计划

こんいちは
