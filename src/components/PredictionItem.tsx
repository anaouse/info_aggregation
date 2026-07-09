import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import type { PredictionData } from "@/types";

const API_BASE = "http://localhost:1233";
const DEBOUNCE_MS = 800;

interface PredictionItemProps {
  data: PredictionData;
  onUpdate: (updated: PredictionData) => void;
}

export default function PredictionItem({ data, onUpdate }: PredictionItemProps) {
  const [text, setText] = useState(data.text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the latest text value so the debounced callback always sees the freshest state
  const textRef = useRef(text);
  textRef.current = text;

  // Sync local text if data.text changes from outside (e.g. parent re-fetch)
  useEffect(() => {
    setText(data.text);
  }, [data.text]);

  const saveText = useCallback(
    (value: string) => {
      axios
        .put<PredictionData>(`${API_BASE}/api/predictions/${data.id}`, { text: value })
        .then((res) => onUpdate(res.data))
        .catch((err) =>
          alert("保存失败：" + (err.response?.data?.error || err.message))
        );
    },
    [data.id, onUpdate]
  );

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveText(textRef.current);
    }, DEBOUNCE_MS);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
        onChange={handleTextChange}
      />
      <div className="prediction-item-actions">
        <button className="prediction-item-btn" onClick={handleToggleDone}>
          {data.done === 1 ? "标为进行中" : "标为完成"}
        </button>
      </div>
    </div>
  );
}
