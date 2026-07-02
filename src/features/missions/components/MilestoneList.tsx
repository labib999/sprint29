"use client";

import {
  toggleMilestone,
  deleteMilestone,
} from "@/features/missions/services/milestoneService";
import type { Milestone } from "@/types";
import { useState } from "react";
import { CreateMilestoneForm } from "./CreateMilestoneForm";
import { PaceIndicator, computePace } from "./PaceIndicator";

interface MilestoneListProps {
  milestones: Milestone[];
  missionId: string;
  defaultWeeklyHours: number | null;
  onMutate: () => void;
}

export function MilestoneList({
  milestones,
  missionId,
  defaultWeeklyHours,
  onMutate,
}: MilestoneListProps) {
  const [showForm, setShowForm] = useState(false);

  async function handleToggle(milestone: Milestone) {
    await toggleMilestone(milestone.id, !milestone.completed);
    onMutate();
  }

  async function handleDelete(id: string) {
    await deleteMilestone(id);
    onMutate();
  }

  return (
    <div className="space-y-1">
      {milestones.map((milestone) => {
        const pace = computePace(milestone);
        return (
          <div key={milestone.id}>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[#1a1a1a]">
              <button
                onClick={() => handleToggle(milestone)}
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                  milestone.completed
                    ? "bg-brand-600 border-brand-600 text-white"
                    : "border-[#333]"
                }`}
              >
                {milestone.completed && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <span
                  className={`block text-sm truncate ${
                    milestone.completed ? "text-[#555] line-through" : "text-white"
                  }`}
                >
                  {milestone.title}
                </span>
                {pace && !milestone.completed && (
                  <PaceIndicator pace={pace} />
                )}
              </div>

              <button
                onClick={() => handleDelete(milestone.id)}
                className="text-xs text-[#555] hover:text-red-500 shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}

      {showForm ? (
        <CreateMilestoneForm
          missionId={missionId}
          defaultWeeklyHours={defaultWeeklyHours}
          onClose={() => { setShowForm(false); onMutate(); }}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs text-[#555] hover:text-brand-500 px-2 py-1"
        >
          + Add milestone
        </button>
      )}
    </div>
  );
}
