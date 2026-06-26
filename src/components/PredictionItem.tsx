import { useState } from "react";
import axios from "axios";
import type { PredictionData } from "@/types";

const API_BASE = "http://localhost:1233";

interface PredictionItemProps {
  data: PredictionData;
  onUpdate: (updated: PredictionData) => void;
}

export default function PredictionItem({ data, onUpdate }: PredictionItemProps) {
  const [text, setText] = useState(data.text);

  const handleUpdateText = () => {
    axios
      .put<PredictionData>(`${API_BASE}/api/predictions/${data.id}`, { text })
      .then((res) => onUpdate(res.data))
      .catch((err) => alert("更新失败：" + (err.response?.data?.error || err.message)));
  };

  const handleToggleDone = () => {
    const nextDone = data.done === 0 ? 1 : 0;
    axios
      .put<PredictionData>(`${API_BASE}/api/predictions/${data.id}`, { done: nextDone })
      .then((res) => onUpdate(res.data))
      .catch((err) => alert("更新失败：" + (err.response?.data?.error || err.message)));
  };

  return (
    <div className="prediction-item">
      <span
        className={`prediction-item-indicator ${data.done === 1 ? "done" : "pending"}`}
        title={data.done === 1 ? "已有结果" : "进行中"}
      />
      <textarea
        className="prediction-item-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="prediction-item-actions">
        <button className="prediction-item-btn" onClick={handleUpdateText}>
          更新内容
        </button>
        <button className="prediction-item-btn" onClick={handleToggleDone}>
          {data.done === 1 ? "标为进行中" : "标为完成"}
        </button>
      </div>
    </div>
  );
}
