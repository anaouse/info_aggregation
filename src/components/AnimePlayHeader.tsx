import { useNavigate } from "react-router-dom";

interface AnimePlayHeaderProps {
  name: string;
}

export default function AnimePlayHeader({ name }: AnimePlayHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="anime-play-header">
      <button className="anime-play-header-back-btn" onClick={() => navigate("/anime")}>
        ← 返回
      </button>
      <span className="anime-play-header-name">{name}</span>
    </header>
  );
}
