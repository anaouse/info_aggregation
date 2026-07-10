interface ShowVideoProps {
  videoUrl: string | null;
  autoPlay?: boolean;
}

export default function ShowVideo({ videoUrl, autoPlay = false }: ShowVideoProps) {
  return (
    <div className="show-video">
      {videoUrl ? (
        <video
          key={videoUrl}
          controls
          autoPlay={autoPlay}
          src={videoUrl}
          className="show-video-player"
        />
      ) : (
        <div className="show-video-placeholder">请从下方选择视频</div>
      )}
    </div>
  );
}
