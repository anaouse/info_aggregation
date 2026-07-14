import { useEffect, useState } from "react";

const STORAGE_KEY = "music_root_path";
const DEFAULT_PATH = "D:\\projects\\my_music";

interface MusicPathBarProps {
  onScan: (path: string) => void;
}

export default function MusicPathBar({ onScan }: MusicPathBarProps) {
  const [path, setPath] = useState(DEFAULT_PATH);

  useEffect(() => {
    setPath(localStorage.getItem(STORAGE_KEY) || DEFAULT_PATH);
  }, []);

  const handleScan = () => {
    const trimmedPath = path.trim();
    if (!trimmedPath) {
      alert("请输入路径");
      return;
    }
    localStorage.setItem(STORAGE_KEY, trimmedPath);
    onScan(trimmedPath);
  };

  return (
    <div className="music-path-bar">
      <input
        type="text"
        placeholder="请输入音乐根目录的绝对路径，例如：D:\music"
        value={path}
        onChange={(event) => setPath(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && handleScan()}
      />
      <button onClick={handleScan}>扫描专辑</button>
    </div>
  );
}
