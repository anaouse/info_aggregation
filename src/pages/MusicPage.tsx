import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { MusicAlbum, MusicScanResponse } from "@/types";
import MusicPathBar from "@/components/MusicPathBar";
import MusicPlayer from "@/components/MusicPlayer";
import MusicPlaylist from "@/components/MusicPlaylist";
import MusicAlbumList from "@/components/MusicAlbumList";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

const API_BASE = "http://localhost:1233";
const STORAGE_KEY = "music_root_path";

export default function MusicPage() {
  const [albums, setAlbums] = useState<MusicAlbum[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playAlbum, setMusicLibrary } = useMusicPlayer();

  useEffect(() => {
    const savedPath = localStorage.getItem(STORAGE_KEY) || "D:\\projects\\my_music";
    handleScan(savedPath);
  }, []);

  const handleScan = (path: string) => {
    localStorage.setItem(STORAGE_KEY, path);
    setLoading(true);
    setError(null);
    axios
      .post<MusicScanResponse>(`${API_BASE}/api/music/scan`, { rootPath: path })
      .then((response) => {
        setAlbums(response.data.albums);
        setMusicLibrary(path, response.data.albums);
      })
      .catch((requestError) => setError(requestError.response?.data?.error || requestError.message))
      .finally(() => setLoading(false));
  };

  const filteredAlbums = useMemo(
    () => albums.filter((album) => album.name.toLowerCase().includes(keyword.trim().toLowerCase())),
    [albums, keyword],
  );

  return (
    <main className="music-page">
      <MusicPathBar onScan={handleScan} />
      {loading && <div className="music-page-message">扫描中...</div>}
      {error && <div className="music-page-error">错误：{error}</div>}
      <MusicPlayer />
      <MusicPlaylist />
      <section className="music-albums-section">
        <div className="music-albums-heading">
          <h2>专辑</h2>
          <input
            type="search"
            placeholder="按专辑名称搜索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        {!loading && !error && <MusicAlbumList albums={filteredAlbums} onPlayAlbum={playAlbum} />}
      </section>
    </main>
  );
}
