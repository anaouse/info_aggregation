import { useEffect, useState } from "react";
import axios from "axios";
import type { AssetSnapshot } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://localhost:1233";

export default function TotalMoneyChart() {
  const [data, setData] = useState<{ date: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<AssetSnapshot[]>(`${API_BASE}/api/assets_snapshots`)
      .then((res) => {
        const points = res.data
          .filter((s) => s.total != null)
          .map((s) => ({
            date: s.assets_snapshot_date.slice(0, 7),
            total: s.total!,
          }))
          .reverse(); // API returns DESC, chart needs ASC
        setData(points);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (data.length === 0) {
    return (
      <div className="total-money-chart">
        <h3 className="total-money-chart-title">总金额趋势</h3>
        <p className="total-money-chart-empty">暂无总金额数据</p>
      </div>
    );
  }

  return (
    <div className="total-money-chart">
      <h3 className="total-money-chart-title">总金额趋势</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-primary-100)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--color-primary-600)" }}
            axisLine={{ stroke: "var(--color-primary-100)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-primary-600)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid var(--color-primary-100)",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="var(--color-primary-400)"
            strokeWidth={2}
            dot={{ fill: "var(--color-primary-400)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
