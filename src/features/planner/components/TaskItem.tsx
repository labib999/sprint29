"use client";

import { completeTask, deleteTask } from "@/features/planner/services/plannerService";
import { computePriorityScore } from "@/features/planner/lib/priorityCalculator";
import type { Task } from "@/types";
import { useState } from "react";

interface TaskItemProps {
  task: Task;
  onMutate: () => void;
}

export function TaskItem({ task, onMutate }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHoursPrompt, setShowHoursPrompt] = useState(false);
  const [actualHours, setActualHours] = useState(
    task.estimated_hours.toString()
  );
  const [isCompleting, setIsCompleting] = useState(false);

  const priority = computePriorityScore({
    mission: task.mission,
    milestone: task.milestone,
  });

  async function handleToggle() {
    if (task.completed) {
      await completeTask(task.id, task.actual_hours);
      onMutate();
    } else {
      setShowHoursPrompt(true);
    }
  }

  async function handleConfirmHours() {
    setIsCompleting(true);
    await completeTask(task.id, parseFloat(actualHours) || task.estimated_hours);
    setShowHoursPrompt(false);
    onMutate();
  }

  function handleSkipHours() {
    return handleConfirmHours();
  }

  async function handleDelete() {
    setIsDeleting(true);
    await deleteTask(task.id);
    onMutate();
  }

  if (isDeleting) return null;

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
          task.completed
            ? "border-gray-100 bg-gray-50"
            : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <button
          onClick={handleToggle}
          disabled={isCompleting}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
            task.completed
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-gray-300"
          } disabled:opacity-50`}
        >
          {task.completed && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <span
            className={`block text-sm truncate ${
              task.completed ? "text-gray-400 line-through" : "text-gray-900"
            }`}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{task.estimated_hours}h</span>
            {task.actual_hours > 0 && task.completed && (
              <span className="text-xs text-gray-400">logged: {task.actual_hours}h</span>
            )}
            {task.mission && (
              <span className="text-xs text-gray-400 truncate">
                {task.mission.title}
              </span>
            )}
            {task.ai_suggested && (
              <span className="text-xs text-purple-500 font-medium">AI</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!task.completed && (
            <span
              className={`text-xs font-medium ${
                priority >= 6
                  ? "text-red-600"
                  : priority >= 4
                  ? "text-amber-600"
                  : "text-gray-400"
              }`}
            >
              P{priority}
            </span>
          )}
          <button
            onClick={handleDelete}
            className="text-xs text-gray-300 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      </div>

      {showHoursPrompt && (
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
          <span className="text-xs text-gray-600">Actual hours:</span>
          <input
            type="number"
            value={actualHours}
            onChange={(e) => setActualHours(e.target.value)}
            min={0}
            step={0.5}
            className="w-20 rounded border border-gray-300 px-2 py-1 text-xs shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            autoFocus
            disabled={isCompleting}
          />
          <button
            onClick={handleConfirmHours}
            disabled={isCompleting}
            className="rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {isCompleting ? "..." : "Confirm"}
          </button>
          <button
            onClick={handleSkipHours}
            disabled={isCompleting}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
