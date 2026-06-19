import { useEffect, useState } from "react";
import axios from "axios";
import Source, { type SourceData } from "@/source";

const API_BASE = "http://localhost:1233";

export default function App() {
  const [sources, setSources] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<SourceData[]>(`${API_BASE}/api/sources`)
      .then((res) => setSources(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app">加载中...</div>;
  if (error) return <div className="app">出错了：{error}</div>;

  return (
    <div className="app">
      <h1>信息源聚合</h1>
      <div className="source-list">
        {sources.map((source) => (
          <Source key={source.url} data={source} />
        ))}
      </div>
    </div>
  );
}
