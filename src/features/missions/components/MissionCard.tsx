"use client";

import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { deleteMission } from "@/features/missions/services/missionService";
import { MilestoneList } from "./MilestoneList";
import { EditMissionForm } from "./EditMissionForm";
import type { Mission } from "@/types";
import { useState } from "react";

interface MissionCardProps {
  mission: Mission;
  onMutate: () => void;
}

export function MissionCard({ mission, onMutate }: MissionCardProps) {
  const [showMilestones, setShowMilestones] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const totalCount = mission.milestones?.length ?? 0;
  const completedCount = mission.milestones?.filter((m) => m.completed).length ?? 0;

  async function handleDelete() {
    if (!confirm("Delete this mission? This cannot be undone.")) return;
    await deleteMission(mission.id);
    onMutate();
  }

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {mission.title}
              </h3>
              {mission.status !== "active" && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    mission.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {mission.status}
                </span>
              )}
            </div>

            {mission.description && (
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {mission.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>
                {"★".repeat(mission.impact)}{"☆".repeat(5 - mission.impact)}
              </span>
              {mission.default_weekly_hours && (
                <span>{mission.default_weekly_hours} hrs/week default</span>
              )}
              {totalCount > 0 && (
                <span>
                  {completedCount}/{totalCount} milestones
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        <button
          onClick={() => setShowMilestones(!showMilestones)}
          className="mt-3 text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          {showMilestones
            ? "Hide milestones"
            : totalCount > 0
            ? `${totalCount} milestone${totalCount > 1 ? "s" : ""}`
            : "Add milestones"}
        </button>

        {showMilestones && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <MilestoneList
              milestones={mission.milestones ?? []}
              missionId={mission.id}
              defaultWeeklyHours={mission.default_weekly_hours}
              onMutate={onMutate}
            />
          </div>
        )}
      </Card>

      {showEdit && (
        <EditMissionForm
          mission={mission}
          onClose={() => { setShowEdit(false); onMutate(); }}
        />
      )}
    </>
  );
}
