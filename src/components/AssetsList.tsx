import { useEffect, useState } from "react";
import axios from "axios";
import type { AssetItem, AssetSnapshot } from "@/types";
import AssetItemRow from "@/components/AssetItem";

const API_BASE = "http://localhost:1233";

/** Return first day of current month as "YYYY-MM-01" */
function getDefaultDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

/** Format "YYYY-MM-01" → "YYYY-MM" for <input type="month"> */
function toMonthValue(date: string): string {
  return date.slice(0, 7);
}

/** Format "YYYY-MM" → "YYYY-MM-01" */
function toDateValue(month: string): string {
  return month + "-01";
}

export default function AssetsList() {
  const [date, setDate] = useState(getDefaultDate);
  const [assets, setAssets] = useState<AssetItem[]>([{ name: "", amount: 0 }]);
  const [total, setTotal] = useState("");
  const [snapshots, setSnapshots] = useState<AssetSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all snapshots on mount
  useEffect(() => {
    axios
      .get<AssetSnapshot[]>(`${API_BASE}/api/assets_snapshots`)
      .then((res) => setSnapshots(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddAsset = () => {
    setAssets((prev) => [...prev, { name: "", amount: 0 }]);
  };

  const handleDeleteAsset = (index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAssetChange = (index: number, name: string, amount: number) => {
    setAssets((prev) =>
      prev.map((a, i) => (i === index ? { name, amount } : a))
    );
  };

  const handleSave = () => {
    // Validate
    const validAssets = assets.filter((a) => a.name.trim() !== "");
    if (validAssets.length === 0) {
      alert("请至少添加一条资产");
      return;
    }
    const names = validAssets.map((a) => a.name.trim());
    if (new Set(names).size !== names.length) {
      alert("资产名称不能重复");
      return;
    }

    const totalValue = total.trim() === "" ? null : parseFloat(total);

    axios
      .post<AssetSnapshot>(`${API_BASE}/api/assets_snapshots`, {
        date,
        assets: validAssets.map((a) => ({ name: a.name.trim(), amount: a.amount })),
        total: totalValue,
      })
      .then((res) => {
        // Refresh snapshots list
        setSnapshots((prev) => {
          const exists = prev.findIndex(
            (s) => s.assets_snapshot_date === date
          );
          if (exists >= 0) {
            return prev.map((s, i) => (i === exists ? res.data : s));
          }
          return [res.data, ...prev].sort(
            (a, b) =>
              b.assets_snapshot_date.localeCompare(a.assets_snapshot_date)
          );
        });
      })
      .catch((err) =>
        alert("保存失败：" + (err.response?.data?.error || err.message))
      );
  };

  const handleSelectSnapshot = (snapshot: AssetSnapshot) => {
    setDate(snapshot.assets_snapshot_date);
    setAssets(
      snapshot.assets.length > 0
        ? snapshot.assets.map((a) => ({ ...a }))
        : [{ name: "", amount: 0 }]
    );
    setTotal(snapshot.total != null ? String(snapshot.total) : "");
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>出错了：{error}</div>;

  return (
    <div className="assets-list">
      {/* Editor section */}
      <div className="assets-list-editor">
        <div className="assets-list-header">
          <input
            type="month"
            className="assets-list-date"
            value={toMonthValue(date)}
            onChange={(e) => setDate(toDateValue(e.target.value))}
          />
          <input
            type="number"
            className="assets-list-total"
            placeholder="总金额"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
          <button className="assets-list-save" onClick={handleSave}>
            确认保存
          </button>
        </div>

        <div className="assets-list-items">
          {assets.map((item, i) => (
            <AssetItemRow
              key={i}
              name={item.name}
              amount={item.amount}
              index={i}
              onDelete={handleDeleteAsset}
              onChange={handleAssetChange}
            />
          ))}
        </div>

        <button className="assets-list-add" onClick={handleAddAsset}>
          + 添加资产类型
        </button>
      </div>

      {/* History section */}
      <div className="assets-list-history">
        <h3 className="assets-list-history-title">历史快照</h3>
        {snapshots.length === 0 ? (
          <p className="assets-list-history-empty">暂无数据</p>
        ) : (
          <div className="assets-list-history-scroll">
            <table className="assets-list-table">
              <thead>
                <tr>
                  <th>月份</th>
                  <th>资产明细</th>
                  <th>总金额</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr
                    key={s.id}
                    className={`assets-list-table-row${
                      s.assets_snapshot_date === date ? " selected" : ""
                    }`}
                    onClick={() => handleSelectSnapshot(s)}
                  >
                    <td>{s.assets_snapshot_date}</td>
                    <td>
                      {s.assets
                        .map((a) => `${a.name}: ${a.amount}`)
                        .join(" / ")}
                    </td>
                    <td className="assets-list-table-total">
                      {s.total != null ? s.total : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
