"use client";

import { MissionList } from "@/features/missions/components/MissionList";
import { DashboardSummaryCards } from "@/features/dashboard/components/DashboardSummaryCards";
import { WeeklyTrendChart } from "@/features/dashboard/components/WeeklyTrendChart";
import { UpcomingDeadlines } from "@/features/dashboard/components/UpcomingDeadlines";
import {
  getOverallStats,
  getWeeklyTrend,
  getUpcomingDeadlines,
} from "@/features/dashboard/services/dashboardService";
import type { OverallStats, WeeklyTrend, UpcomingDeadline } from "@/features/dashboard/services/dashboardService";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [trend, setTrend] = useState<WeeklyTrend[]>([]);
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverallStats(),
      getWeeklyTrend(),
      getUpcomingDeadlines(),
    ])
      .then(([s, t, d]) => {
        setStats(s);
        setTrend(t);
        setDeadlines(d);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-[#111111]" />
          ))}
        </div>
        <div className="h-48 rounded-lg bg-[#111111]" />
        <div className="h-40 rounded-lg bg-[#111111]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stats && <DashboardSummaryCards stats={stats} />}

      <WeeklyTrendChart data={trend} />

      <UpcomingDeadlines deadlines={deadlines} />

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Missions</h2>
        <MissionList />
      </div>
    </div>
  );
}
