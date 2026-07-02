"use client";

import { deleteMission } from "@/features/missions/services/missionService";
import { MilestoneList } from "./MilestoneList";
import type { Mission } from "@/types";
import { useState } from "react";

interface MissionCardProps {
  mission: Mission;
  onMutate: () => void;
}

export function MissionCard({ mission, onMutate }: MissionCardProps) {
  const [showMilestones, setShowMilestones] = useState(false);

  const incomplete = (mission.milestones ?? []).filter((m) => !m.completed);
  const nextDeadline = incomplete.length > 0
    ? incomplete
        .filter((m) => m.deadline)
        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0]
    : null;

  const deadlineStr = nextDeadline
    ? (() => {
        const days = Math.ceil((new Date(nextDeadline.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return days <= 0 ? "Overdue" : `${days}d left`;
      })()
    : null;

  async function handleDelete() {
    if (!confirm("Delete this mission?")) return;
    await deleteMission(mission.id);
    onMutate();
  }

  return (
    <div className="rounded-lg bg-[#111111]">
      <button
        onClick={() => setShowMilestones(!showMilestones)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#555]">
              {"★".repeat(mission.impact)}{"☆".repeat(5 - mission.impact)}
            </span>
            <h3 className="text-sm font-semibold text-white truncate">
              {mission.title}
            </h3>
            {mission.status !== "active" && (
              <span className="text-xs text-[#555]">({mission.status})</span>
            )}
          </div>
          {deadlineStr && (
            <p className="text-xs text-[#555] mt-0.5">
              {nextDeadline?.title} — {deadlineStr}
            </p>
          )}
          {(mission.milestones ?? []).length > 0 && (
            <PaceLine milestones={mission.milestones ?? []} />
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-xs text-[#555]">
            {(mission.milestones ?? []).filter((m) => m.completed).length}/{(mission.milestones ?? []).length}
          </span>
          <svg
            className={`h-4 w-4 text-[#555] transition-transform ${showMilestones ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {showMilestones && (
        <div className="border-t border-[#1a1a1a] px-4 pb-4 pt-3">
          <MilestoneList
            milestones={mission.milestones ?? []}
            missionId={mission.id}
            defaultWeeklyHours={mission.default_weekly_hours}
            onMutate={onMutate}
          />
        </div>
      )}

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={handleDelete}
          className="text-xs text-[#555] hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function PaceLine({ milestones }: { milestones: Mission["milestones"] }) {
  const sorted = (milestones ?? [])
    .filter((m) => !m.completed && m.hours_planned_total)
    .sort((a, b) => {
      const aPct = a.hours_planned_total ? (a.hours_logged_total / a.hours_planned_total) : 0;
      const bPct = b.hours_planned_total ? (b.hours_logged_total / b.hours_planned_total) : 0;
      return aPct - bPct;
    });

  if (sorted.length === 0) return null;

  const worst = sorted[0];
  const pct = worst.hours_planned_total
    ? Math.min(worst.hours_logged_total / worst.hours_planned_total, 1)
    : 0;

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-[#1a1a1a]">
        <div
          className="h-1 rounded-full bg-brand-500 transition-all"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      <span className="text-xs text-[#555]">{worst.title}</span>
    </div>
  );
}
