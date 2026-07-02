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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-[#1a1a1a] p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What do you want to work on?"
        autoFocus
        disabled={isSubmitting}
      />

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            required
            min={0.5}
            step={0.5}
            disabled={isSubmitting}
          />
        </div>
        <div className="flex-[2]">
          <label className="block text-xs font-medium text-[#a1a1aa] mb-1">Mission</label>
          <select
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(e.target.value)}
            disabled={isSubmitting}
            className="w-full"
          >
            <option value="">No mission</option>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white"
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
