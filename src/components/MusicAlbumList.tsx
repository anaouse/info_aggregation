import type { MusicAlbum, PlaylistSong } from "@/types";
import MusicAlbumItem from "@/components/MusicAlbumItem";

interface MusicAlbumListProps {
  albums: MusicAlbum[];
  onPlayAlbum: (songs: PlaylistSong[]) => void;
}

export default function MusicAlbumList({ albums, onPlayAlbum }: MusicAlbumListProps) {
  if (albums.length === 0) {
    return <div className="music-album-list-empty">没有匹配的专辑。</div>;
  }

  return (
    <div className="music-album-list">
      {albums.map((album) => (
        <MusicAlbumItem key={album.folder_path} album={album} onPlayAlbum={onPlayAlbum} />
      ))}
    </div>
  );
}
