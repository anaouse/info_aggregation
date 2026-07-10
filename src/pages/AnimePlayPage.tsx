import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import type { VideosResponse, VideoFile } from "@/types";
import AnimePlayHeader from "@/components/AnimePlayHeader";
import ShowVideo from "@/components/ShowVideo";
import ShowFiles from "@/components/ShowFiles";

const API_BASE = "http://localhost:1233";
const STORAGE_KEY = "anime_root_path";

export default function AnimePlayPage() {
  const [searchParams] = useSearchParams();
  const animeName = searchParams.get("name") || "";
  
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rootPath = localStorage.getItem(STORAGE_KEY);
    if (!rootPath || !animeName) {
      setError("缺少必要参数");
      setLoading(false);
      return;
    }

    const folderPath = `${rootPath}\\${animeName}`;
    
    axios
      .get<VideosResponse>(`${API_BASE}/api/anime/videos`, {
        params: { folderPath },
      })
      .then((res) => {
        setVideos(res.data.videos);
        setError(null);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [animeName]);

  const handleVideoSelect = (video: VideoFile) => {
    setCurrentVideo(video);
  };

  const videoUrl = currentVideo
    ? `${API_BASE}/api/anime/video?path=${encodeURIComponent(currentVideo.path)}`
    : null;

  if (loading) return <div>加载中...</div>;
  if (error) return <div style={{ color: "red" }}>错误：{error}</div>;

  return (
    <div className="anime-play-page">
      <AnimePlayHeader name={animeName} />
      <ShowVideo videoUrl={videoUrl} autoPlay />
      <ShowFiles videos={videos} currentPath={currentVideo?.path || null} onSelect={handleVideoSelect} />
    </div>
  );
}
