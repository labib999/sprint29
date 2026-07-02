"use client";

import { createMilestone } from "@/features/missions/services/milestoneService";
import { useState } from "react";

interface CreateMilestoneFormProps {
  missionId: string;
  defaultWeeklyHours: number | null;
  onClose: () => void;
}

export function CreateMilestoneForm({
  missionId,
  defaultWeeklyHours,
  onClose,
}: CreateMilestoneFormProps) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(
    defaultWeeklyHours?.toString() ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !deadline || !weeklyHours) return;

    setIsSubmitting(true);
    try {
      await createMilestone({
        mission_id: missionId,
        title: title.trim(),
        deadline,
        weekly_committed_hours: parseFloat(weeklyHours),
      });
      setTitle("");
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Milestone title"
        className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        autoFocus
        disabled={isSubmitting}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Deadline
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">
            Hrs/week
          </label>
          <input
            type="number"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(e.target.value)}
            required
            min={0}
            step={0.5}
            placeholder={defaultWeeklyHours ? `Default: ${defaultWeeklyHours}` : "Hours"}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || !deadline || !weeklyHours || isSubmitting}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
