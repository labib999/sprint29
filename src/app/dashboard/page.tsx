"use client";

import { UserMenu } from "@/features/auth/components/UserMenu";
import { MissionList } from "@/features/missions/components/MissionList";
import { DashboardSummaryCards } from "@/features/dashboard/components/DashboardSummaryCards";
import { WeeklyTrendChart } from "@/features/dashboard/components/WeeklyTrendChart";
import { MissionProgressList } from "@/features/dashboard/components/MissionProgressList";
import {
  getOverallStats,
  getWeeklyTrend,
  getMissionProgress,
} from "@/features/dashboard/services/dashboardService";
import type { OverallStats, WeeklyTrend, MissionProgress } from "@/features/dashboard/services/dashboardService";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [trend, setTrend] = useState<WeeklyTrend[]>([]);
  const [missions, setMissions] = useState<MissionProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getOverallStats(),
      getWeeklyTrend(),
      getMissionProgress(),
    ])
      .then(([s, t, m]) => {
        setStats(s);
        setTrend(t);
        setMissions(m);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Sprint29</h1>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm">
            <span className="font-medium text-brand-600">Missions</span>
            <a
              href="/weekly"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Weekly Plan
            </a>
          </nav>
          <UserMenu />
        </div>
      </header>

      <main className="mt-8 space-y-6">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading analytics...
          </div>
        ) : (
          <>
            {stats && <DashboardSummaryCards stats={stats} />}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <WeeklyTrendChart data={trend} />
              <MissionProgressList missions={missions} />
            </div>
          </>
        )}

        <MissionList />
      </main>
    </div>
  );
}
