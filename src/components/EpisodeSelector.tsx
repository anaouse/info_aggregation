import type { VideoFile } from "@/types";

interface EpisodeSelectorProps {
  videos: VideoFile[];
  currentPath: string | null;
  onSelect: (video: VideoFile) => void;
  onClose: () => void;
}

export default function EpisodeSelector({ 
  videos, 
  currentPath, 
  onSelect,
  onClose 
}: EpisodeSelectorProps) {
  const handleSelect = (video: VideoFile) => {
    onSelect(video);
    onClose();
  };

  return (
    <div className="episode-selector-overlay" onClick={onClose}>
      <div className="episode-selector" onClick={(e) => e.stopPropagation()}>
        <div className="episode-selector-header">
          <h3 className="episode-selector-title">选集</h3>
          <button 
            className="episode-selector-close" 
            onClick={onClose}
            aria-label="Close episode selector"
          >
            ✕
          </button>
        </div>
        
        <div className="episode-selector-list">
          {videos.length === 0 ? (
            <div className="episode-selector-empty">未找到视频文件</div>
          ) : (
            videos.map((video, index) => (
              <div
                key={video.path}
                className={`episode-selector-item${
                  video.path === currentPath ? " active" : ""
                }`}
                onClick={() => handleSelect(video)}
              >
                <span className="episode-selector-item-number">{index + 1}</span>
                <span className="episode-selector-item-name">{video.name}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
