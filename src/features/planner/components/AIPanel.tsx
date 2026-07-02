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
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  async function handleGetSuggestions() {
    setIsLoading(true);
    setError(null);
    const result = await getAISuggestions({ missions, weekId });
    if (result.error) setError(result.error);
    if (result.suggestions.length > 0) setSuggestions(result.suggestions);
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
      // silently fail
    }
    setAddingIds((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-colors"
        aria-label="AI Suggestions"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`fixed z-50 transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "translate-x-full"
        } top-0 right-0 h-full w-full sm:w-80 bg-[#111111] border-l border-[#1a1a1a] overflow-y-auto`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">AI Suggestions</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#555] hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {suggestions.length === 0 && !isLoading && !error && (
            <div className="space-y-3">
              <p className="text-sm text-[#a1a1aa]">
                Get AI-powered suggestions for what to work on this week.
              </p>
              <button
                onClick={handleGetSuggestions}
                disabled={missions.length === 0 || isLoading}
                className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {isLoading ? "Thinking..." : "Get Suggestions"}
              </button>
              {missions.length === 0 && (
                <p className="text-xs text-[#555]">
                  Create a mission first — AI needs context.
                </p>
              )}
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              <div className="h-16 rounded-lg bg-[#1a1a1a] animate-pulse" />
              <div className="h-16 rounded-lg bg-[#1a1a1a] animate-pulse" />
              <div className="h-16 rounded-lg bg-[#1a1a1a] animate-pulse" />
            </div>
          )}

          {error && !isLoading && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <div key={i} className="rounded-lg bg-[#1a1a1a] p-3">
                  <p className="text-sm text-white">{s.title}</p>
                  <p className="text-xs text-[#555] mt-1">{s.reason}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-[#555]">{s.estimated_hours}h</span>
                    <button
                      onClick={() => handleAddSuggestion(i, s)}
                      disabled={addingIds.has(i)}
                      className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                    >
                      {addingIds.has(i) ? "..." : "Add"}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => { setSuggestions([]); setIsOpen(false); }}
                className="w-full text-xs text-[#555] hover:text-white py-2"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
