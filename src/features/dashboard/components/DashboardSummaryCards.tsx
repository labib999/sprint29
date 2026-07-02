"use client";

import type { OverallStats } from "../services/dashboardService";

interface DashboardSummaryCardsProps {
  stats: OverallStats;
}

export function DashboardSummaryCards({ stats }: DashboardSummaryCardsProps) {
  const cards = [
    {
      label: "Current Week Progress",
      value: `${stats.currentWeekTasksCompleted} tasks / ${stats.currentWeekHoursLogged}h`,
      sub: stats.currentWeekTasksCompleted > 0 ? "on track" : "no tasks yet",
    },
    {
      label: "Active Missions",
      value: `${stats.activeMissions}`,
      sub: `${stats.completedMissions} completed`,
    },
    {
      label: "Overall Pace",
      value: `${stats.completedMilestones}/${stats.totalMilestones}`,
      sub: `${stats.behindMilestones} behind pace`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg bg-[#111111] p-4"
        >
          <p className="text-xs text-[#a1a1aa]">{card.label}</p>
          <p className="mt-1 text-xl font-bold text-white">{card.value}</p>
          <p className="mt-0.5 text-xs text-[#555]">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
