import { useEffect, useState } from "react";

const STORAGE_KEY = "anime_root_path";

interface SetPathBarProps {
  onScan: (path: string) => void;
}

export default function SetPathBar({ onScan }: SetPathBarProps) {
  const [path, setPath] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPath(saved);
    }
  }, []);

  const handleScan = () => {
    if (!path.trim()) {
      alert("请输入路径");
      return;
    }
    localStorage.setItem(STORAGE_KEY, path.trim());
    onScan(path.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  return (
    <div className="set-path-bar">
      <input
        type="text"
        placeholder="请输入动漫根目录的绝对路径，例如：D:\anime"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleScan}>扫描</button>
    </div>
  );
}
