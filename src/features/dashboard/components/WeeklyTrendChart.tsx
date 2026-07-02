"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { WeeklyTrend } from "../services/dashboardService";

interface WeeklyTrendChartProps {
  data: WeeklyTrend[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.weekStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    planned: d.planned || 0,
    logged: d.logged || 0,
  }));

  return (
    <div className="rounded-lg bg-[#111111] p-4">
      <h3 className="mb-4 text-sm font-semibold text-white">
        Weekly Trend
      </h3>
      {data.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#555]">
          Complete a week to see trends.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={formatted} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#555" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#555" }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #333",
                background: "#1a1a1a",
                color: "#fff",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8, color: "#a1a1aa" }}
            />
            <Bar
              dataKey="planned"
              name="Planned"
              fill="#555"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
            <Bar
              dataKey="logged"
              name="Logged"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
