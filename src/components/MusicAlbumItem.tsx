import { useState } from "react";
import type { MusicAlbum, PlaylistSong } from "@/types";

const API_BASE = "http://localhost:1233";

interface MusicAlbumItemProps {
  album: MusicAlbum;
  onPlayAlbum: (songs: PlaylistSong[]) => void;
}

export default function MusicAlbumItem({ album, onPlayAlbum }: MusicAlbumItemProps) {
  const [coverFailed, setCoverFailed] = useState(false);

  const handlePlay = () => {
    onPlayAlbum(album.songs.map((song) => ({ ...song, album_name: album.name })));
  };

  return (
    <article className="music-album-item">
      <div className="music-album-cover">
        {coverFailed ? (
          <div className="music-album-cover-placeholder">无封面</div>
        ) : (
          <img
            src={`${API_BASE}/api/music/cover?folderPath=${encodeURIComponent(album.folder_path)}`}
            alt={album.name}
            onError={() => setCoverFailed(true)}
          />
        )}
      </div>
      <div className="music-album-name">{album.name}</div>
      <button onClick={handlePlay} disabled={album.songs.length === 0}>
        播放本专辑
      </button>
    </article>
  );
}
