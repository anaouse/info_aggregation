import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import type { VideosResponse, VideoFile, SubtitlesResponse, SubtitleFile } from "@/types";
import AnimePlayHeader from "@/components/AnimePlayHeader";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

const API_BASE = "http://localhost:1233";
const STORAGE_KEY = "anime_root_path";

export default function AnimePlayPage() {
  const [searchParams] = useSearchParams();
  const animeName = searchParams.get("name") || "";
  
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleFile[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [activeSubtitlePath, setActiveSubtitlePath] = useState<string | null>(null);
  const [subtitleContent, setSubtitleContent] = useState<string | null>(null);
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
    
    Promise.all([
      axios.get<VideosResponse>(`${API_BASE}/api/anime/videos`, {
        params: { folderPath },
      }),
      axios.get<SubtitlesResponse>(`${API_BASE}/api/anime/subtitles`, {
        params: { folderPath },
      }),
    ])
      .then(([videosRes, subtitlesRes]) => {
        setVideos(videosRes.data.videos);
        setSubtitles(subtitlesRes.data.subtitles);
        setError(null);
      })
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [animeName]);

  const handleVideoSelect = (video: VideoFile) => {
    setCurrentVideo(video);
  };

  const handleSubtitleSelect = (subtitle: SubtitleFile) => {
    // Toggle off if clicking the already active subtitle
    if (subtitle.path === activeSubtitlePath) {
      setActiveSubtitlePath(null);
      setSubtitleContent(null);
      return;
    }

    axios
      .get(`${API_BASE}/api/anime/subtitle`, {
        params: { path: subtitle.path },
      })
      .then((res) => {
        setSubtitleContent(res.data.content);
        setActiveSubtitlePath(subtitle.path);
      })
      .catch((err) => console.error("Failed to load subtitle:", err));
  };

  const videoUrl = currentVideo
    ? `${API_BASE}/api/anime/video?path=${encodeURIComponent(currentVideo.path)}`
    : null;

  if (loading) return <div>加载中...</div>;
  if (error) return <div style={{ color: "red" }}>错误：{error}</div>;

  return (
    <div className="anime-play-page">
      <AnimePlayHeader name={animeName} />
      <CustomVideoPlayer
        videoUrl={videoUrl}
        videos={videos}
        currentPath={currentVideo?.path || null}
        onVideoSelect={handleVideoSelect}
        subtitles={subtitles}
        onSubtitleSelect={handleSubtitleSelect}
        subtitleContent={subtitleContent}
        activeSubtitlePath={activeSubtitlePath}
        autoPlay
      />
    </div>
  );
}
