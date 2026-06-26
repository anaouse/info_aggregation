import { useEffect, useState } from "react";
import axios from "axios";
import type { PredictionData } from "@/types";
import AddPredictionBar from "@/components/AddPredictionBar";
import PredictionsList from "@/components/PredictionsList";

const API_BASE = "http://localhost:1233";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<PredictionData[]>(`${API_BASE}/api/predictions`)
      .then((res) => setPredictions(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = (text: string) => {
    axios
      .post<PredictionData>(`${API_BASE}/api/predictions`, { text })
      .then((res) => setPredictions((prev) => [...prev, res.data]))
      .catch((err) => alert("添加失败：" + (err.response?.data?.error || err.message)));
  };

  const handleUpdate = (updated: PredictionData) => {
    setPredictions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了：{error}</div>;

  return (
    <>
      <AddPredictionBar onAdd={handleAdd} />
      <PredictionsList predictions={predictions} onUpdate={handleUpdate} />
    </>
  );
}
