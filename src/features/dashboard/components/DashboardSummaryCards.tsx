"use client";

import type { OverallStats } from "../services/dashboardService";

interface DashboardSummaryCardsProps {
  stats: OverallStats;
}

export function DashboardSummaryCards({ stats }: DashboardSummaryCardsProps) {
  const cards = [
    {
      label: "Active Missions",
      value: stats.activeMissions,
      sub: `${stats.completedMissions} completed`,
      color: "border-l-brand-500",
    },
    {
      label: "Milestones",
      value: `${stats.completedMilestones}/${stats.totalMilestones}`,
      sub: `${stats.behindMilestones} behind pace`,
      color: "border-l-amber-500",
    },
    {
      label: "Total Hours Logged",
      value: `${stats.totalHoursLogged}h`,
      sub: `${stats.currentWeekHoursLogged}h this week`,
      color: "border-l-green-500",
    },
    {
      label: "Tasks Done This Week",
      value: stats.currentWeekTasksCompleted,
      sub: "keep it up!",
      color: "border-l-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`rounded-lg border border-gray-200 bg-white p-4 border-l-4 ${card.color}`}
        >
          <p className="text-xs text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
