import { useEffect, useState } from "react";
import axios from "axios";
import type { AnimeScanResponse } from "@/types";
import SetPathBar from "@/components/SetPathBar";
import AnimeList from "@/components/AnimeList";

const API_BASE = "http://localhost:1233";
const STORAGE_KEY = "anime_root_path";

export default function AnimePage() {
  const [animes, setAnimes] = useState<AnimeScanResponse["animes"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scan on mount if path is saved
  useEffect(() => {
    const savedPath = localStorage.getItem(STORAGE_KEY);
    if (savedPath) {
      handleScan(savedPath);
    }
  }, []);

  const handleScan = (path: string) => {
    setLoading(true);
    setError(null);
    axios
      .post<AnimeScanResponse>(`${API_BASE}/api/anime/scan`, { rootPath: path })
      .then((res) => setAnimes(res.data.animes))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <SetPathBar onScan={handleScan} />
      {loading && <div>扫描中...</div>}
      {error && <div style={{ color: "red" }}>错误：{error}</div>}
      {!loading && !error && <AnimeList animes={animes} />}
    </>
  );
}
