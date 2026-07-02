"use client";

import { getAISuggestions } from "@/features/ai/services/aiService";
import { createTask } from "@/features/planner/services/plannerService";
import type { Mission, AISuggestion } from "@/types";
import { useState } from "react";

interface AIPanelProps {
  missions: Mission[];
  weekId: string;
  onMutate: () => void;
}

export function AIPanel({ missions, weekId, onMutate }: AIPanelProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  async function handleGetSuggestions() {
    setIsLoading(true);
    setError(null);

    const result = await getAISuggestions({ missions, weekId });

    if (result.error) {
      setError(result.error);
    }

    if (result.suggestions.length > 0) {
      setSuggestions(result.suggestions);
    }

    setIsLoading(false);
  }

  async function handleAddSuggestion(index: number, suggestion: AISuggestion) {
    setAddingIds((prev) => new Set(prev).add(index));
    try {
      await createTask({
        week_id: weekId,
        title: suggestion.title,
        estimated_hours: suggestion.estimated_hours,
        mission_id: suggestion.mission_id ?? undefined,
        milestone_id: suggestion.milestone_id ?? undefined,
        ai_suggested: true,
      });
      onMutate();
    } catch {
      // Silently fail — user can retry
    }
    setAddingIds((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }

  async function handleAddAll() {
    for (let i = 0; i < suggestions.length; i++) {
      await handleAddSuggestion(i, suggestions[i]);
    }
    setSuggestions([]);
  }

  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-purple-900">AI Suggestions</h3>
        {!hasSuggestions && (
          <button
            onClick={handleGetSuggestions}
            disabled={missions.length === 0 || isLoading}
            className="rounded-lg bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Get Suggestions"}
          </button>
        )}
      </div>

      {isLoading && !hasSuggestions && (
        <p className="text-sm text-purple-700">Thinking... this may take a moment.</p>
      )}

      {error && !hasSuggestions && !isLoading && (
        <p className="text-sm text-purple-700">{error}</p>
      )}

      {missions.length === 0 && !isLoading && !hasSuggestions && (
        <p className="text-sm text-purple-700">
          Create a mission first — AI needs context to suggest tasks.
        </p>
      )}

      {hasSuggestions && (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-purple-100 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.estimated_hours}h</p>
                </div>
                <button
                  onClick={() => handleAddSuggestion(i, s)}
                  disabled={addingIds.has(i)}
                  className="shrink-0 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                >
                  {addingIds.has(i) ? "..." : "Add"}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddAll}
            className="w-full rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
          >
            Add All to Week
          </button>

          <button
            onClick={() => setSuggestions([])}
            className="w-full text-xs text-purple-600 hover:text-purple-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
