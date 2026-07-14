import type { MusicAlbum, PlaylistSong } from "@/types";

interface MusicAlbumItemProps {
  album: MusicAlbum;
  onPlayAlbum: (songs: PlaylistSong[]) => void;
}

export default function MusicAlbumItem({ album, onPlayAlbum }: MusicAlbumItemProps) {
  const handlePlay = () => {
    onPlayAlbum(album.songs.map((song) => ({ ...song, album_name: album.name })));
  };

  return (
    <article className="music-album-item">
      <div className="music-album-name">{album.name}</div>
      <div className="music-album-song-count">{album.songs.length} 首歌曲</div>
      <button onClick={handlePlay} disabled={album.songs.length === 0}>播放本专辑</button>
    </article>
  );
}
