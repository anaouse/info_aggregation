import type { AnimeInfo } from "@/types";
import AnimeItem from "@/components/AnimeItem";

interface AnimeListProps {
  animes: AnimeInfo[];
}

export default function AnimeList({ animes }: AnimeListProps) {
  if (animes.length === 0) {
    return <div className="anime-list-empty">暂无动漫</div>;
  }

  return (
    <div className="anime-list">
      {animes.map((anime) => (
        <AnimeItem key={anime.folder_path} data={anime} />
      ))}
    </div>
  );
}
