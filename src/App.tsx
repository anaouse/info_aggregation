import { useEffect, useState } from "react";
import axios from "axios";
import type { SourceData } from "@/types";
import SourcesList from "@/components/SourcesList";
import AddSourceBar from "@/components/AddSourceBar";

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
      <AddSourceBar
        name={newName}
        url={newUrl}
        onNameChange={setNewName}
        onUrlChange={setNewUrl}
        onAdd={handleAdd}
      />
      <SourcesList sources={sources} onDelete={handleDelete} />
    </div>
  );
}
