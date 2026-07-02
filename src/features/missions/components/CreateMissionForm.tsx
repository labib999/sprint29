"use client";

import { createMission } from "@/features/missions/services/missionService";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CreateMissionFormProps {
  onClose: () => void;
}

export function CreateMissionForm({ onClose }: CreateMissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [impact, setImpact] = useState(3);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const description = form.get("description") as string;
    const weeklyHours = form.get("default_weekly_hours") as string;

    if (!title || title.trim().length === 0) {
      setError("Title is required");
      setIsSubmitting(false);
      return;
    }

    try {
      await createMission({
        title: title.trim(),
        description: description.trim() || undefined,
        impact,
        default_weekly_hours: weeklyHours ? parseFloat(weeklyHours) : undefined,
      });
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mission");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-sm rounded-xl bg-[#111111] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">New Mission</h2>
          <button onClick={onClose} className="text-[#555] hover:text-white">✕</button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Title</label>
            <input name="title" type="text" required placeholder="What do you want to achieve?" className="w-full" autoFocus />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Description</label>
            <textarea name="description" rows={2} placeholder="Why is this important?" className="w-full resize-none" />
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
                      : "bg-[#1a1a1a] text-[#555] hover:bg-[#222]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Default hrs/week</label>
            <input name="default_weekly_hours" type="number" min={0} step={0.5} placeholder="Optional" className="w-full" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-[#a1a1aa] hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
