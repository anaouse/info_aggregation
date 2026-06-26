import { useState, type KeyboardEvent } from "react";

interface AddPredictionBarProps {
  onAdd: (text: string) => void;
}

export default function AddPredictionBar({ onAdd }: AddPredictionBarProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="add-prediction-bar">
      <input
        type="text"
        placeholder="写下你的预言..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSubmit}>添加</button>
    </div>
  );
}
