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

interface ChartPoint {
  date: string;
  total: number;
  change: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  return (
    <div
      style={{
        border: "1px solid var(--color-primary-100)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        background: "#fff",
      }}
    >
      <div>日期：{point.date}</div>
      <div>总金额：{point.total}</div>
      <div>相对上月变化：{point.change}</div>
    </div>
  );
}

export default function TotalMoneyChart() {
  const [data, setData] = useState<ChartPoint[]>([]);
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
          .reverse() // API returns DESC, chart needs ASC
          .map((point, index, points) => ({
            ...point,
            change:
              index === 0 || points[index - 1].total === 0
                ? "无"
                : `${((point.total - points[index - 1].total) / points[index - 1].total * 100).toFixed(2)}%`,
          }));
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
          <Tooltip content={<ChartTooltip />} />
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
