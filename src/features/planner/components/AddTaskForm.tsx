"use client";

import { createTask } from "@/features/planner/services/plannerService";
import { getMissions } from "@/features/missions/services/missionService";
import type { Mission } from "@/types";
import { useEffect, useState } from "react";

interface AddTaskFormProps {
  weekId: string;
  onClose: () => void;
}

export function AddTaskForm({ weekId, onClose }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getMissions().then(setMissions).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !hours) return;

    setIsSubmitting(true);
    try {
      await createTask({
        week_id: weekId,
        title: title.trim(),
        estimated_hours: parseFloat(hours),
        mission_id: selectedMissionId || undefined,
      });
      setTitle("");
      setHours("");
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
        placeholder="What do you want to work on this week?"
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        autoFocus
        disabled={isSubmitting}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            min={0.5}
            step={0.5}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex-[2]">
          <label className="block text-xs font-medium text-gray-600">Mission (optional)</label>
          <select
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            disabled={isSubmitting}
          >
            <option value="">No mission</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
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
          disabled={!title.trim() || !hours || isSubmitting}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add Task
        </button>
      </div>
    </form>
  );
}
