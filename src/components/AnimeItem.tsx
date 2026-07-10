import type { AnimeInfo } from "@/types";

const API_BASE = "http://localhost:1233";

interface AnimeItemProps {
  data: AnimeInfo;
}

export default function AnimeItem({ data }: AnimeItemProps) {
  const { name, cover_path, video_count } = data;

  return (
    <div className="anime-item">
      <div className="anime-item-cover">
        {cover_path ? (
          <img
            src={`${API_BASE}/api/anime/cover?path=${encodeURIComponent(cover_path)}`}
            alt={name}
          />
        ) : (
          <div className="anime-item-cover-placeholder">无封面</div>
        )}
      </div>
      <div className="anime-item-name">{name}</div>
      <div className="anime-item-video-count">{video_count} 个视频</div>
    </div>
  );
}
