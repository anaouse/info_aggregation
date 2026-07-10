import type { VideoFile } from "@/types";

interface ShowFilesProps {
  videos: VideoFile[];
  currentPath: string | null;
  onSelect: (video: VideoFile) => void;
}

export default function ShowFiles({ videos, currentPath, onSelect }: ShowFilesProps) {
  if (videos.length === 0) {
    return <div className="show-files-empty">未找到视频文件</div>;
  }

  return (
    <div className="show-files">
      {videos.map((video) => (
        <div
          key={video.path}
          className={`show-files-item${video.path === currentPath ? " active" : ""}`}
          onClick={() => onSelect(video)}
        >
          {video.name}
        </div>
      ))}
    </div>
  );
}
