import { useEffect, useState } from "react";
import axios from "axios";
import Source, { type SourceData } from "@/source";

const API_BASE = "http://localhost:1233";

export default function App() {
  const [sources, setSources] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    axios
      .get<SourceData[]>(`${API_BASE}/api/sources`)
      .then((res) => setSources(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (url: string) => {
    axios
      .delete(`${API_BASE}/api/sources`, { data: { url } })
      .then(() => setSources((prev) => prev.filter((s) => s.url !== url)))
      .catch((err) => alert("删除失败：" + err.message));
  };

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) {
      alert("名称和 URL 不能为空");
      return;
    }
    axios
      .post<SourceData>(`${API_BASE}/api/sources`, {
        source_name: newName.trim(),
        url: newUrl.trim(),
      })
      .then((res) => {
        setSources((prev) => [...prev, res.data]);
        setNewName("");
        setNewUrl("");
      })
      .catch((err) => alert("添加失败：" + (err.response?.data?.error || err.message)));
  };

  if (loading) return <div className="app">加载中...</div>;
  if (error) return <div className="app">出错了：{error}</div>;

  return (
    <div className="app">
      <h1>信息源聚合</h1>
      <div className="add-source">
        <input
          type="text"
          placeholder="信息源名称"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <button onClick={handleAdd}>添加</button>
      </div>
      <div className="source-list">
        {sources.map((source) => (
          <Source key={source.url} data={source} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
