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
  const [impact, setImpact] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(
    defaultWeeklyHours?.toString() ?? ""
  );
  const [aiContext, setAiContext] = useState("");
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
        ai_context: aiContext.trim() || undefined,
      });
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-[#1a1a1a] p-5">
      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Milestone title"
          autoFocus
          disabled={isSubmitting}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Deadline</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
          disabled={isSubmitting}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Impact</label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setImpact(n)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                n <= impact
                  ? "bg-brand-600 text-white"
                  : "bg-[#111111] text-[#555] hover:bg-[#222]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Weekly Committed Hours</label>
        <input
          type="number"
          value={weeklyHours}
          onChange={(e) => setWeeklyHours(e.target.value)}
          required
          min={0}
          step={0.5}
          placeholder={defaultWeeklyHours ? `Default: ${defaultWeeklyHours}` : "Hours per week"}
          disabled={isSubmitting}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">
          Context for AI <span className="text-[#555]">(optional)</span>
        </label>
        <textarea
          value={aiContext}
          onChange={(e) => setAiContext(e.target.value)}
          placeholder="e.g. currently at 900 CF rating, targeting 1200 by December"
          rows={2}
          disabled={isSubmitting}
          className="w-full resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
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
          disabled={!title.trim() || !deadline || !weeklyHours || isSubmitting}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
