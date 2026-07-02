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
  const [actualHours, setActualHours] = useState(task.estimated_hours.toString());
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

  async function handleDelete() {
    setIsDeleting(true);
    await deleteTask(task.id);
    onMutate();
  }

  if (isDeleting) return null;

  return (
    <div>
      <div
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
          task.completed ? "bg-[#1a1a1a]" : "bg-[#111111] hover:bg-[#1a1a1a]"
        }`}
      >
        <button
          onClick={handleToggle}
          disabled={isCompleting}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all ${
            task.completed
              ? "bg-brand-600 text-white scale-110"
              : "border border-[#333]"
          } disabled:opacity-50`}
        >
          {task.completed && (
            <svg className="h-3 w-3 animate-[scale-in_0.2s_ease-out]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <span
            className={`block text-sm truncate transition-colors ${
              task.completed ? "text-[#555] line-through" : "text-white"
            }`}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#555]">{task.estimated_hours}h</span>
            {task.actual_hours > 0 && task.completed && (
              <span className="text-xs text-[#555]">logged: {task.actual_hours}h</span>
            )}
            {task.mission && (
              <span className="text-xs text-[#555] truncate">{task.mission.title}</span>
            )}
            {task.ai_suggested && (
              <span className="text-xs text-brand-500 font-medium">AI</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!task.completed && (
            <span
              className={`text-xs font-medium ${
                priority >= 6 ? "text-red-500" : priority >= 4 ? "text-amber-500" : "text-[#555]"
              }`}
            >
              P{priority}
            </span>
          )}
          <button onClick={handleDelete} className="text-xs text-[#555] hover:text-red-500">
            ✕
          </button>
        </div>
      </div>

      {showHoursPrompt && (
        <div className="mt-1 flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-sm">
          <span className="text-xs text-[#a1a1aa]">Actual hours:</span>
          <input
            type="number"
            value={actualHours}
            onChange={(e) => setActualHours(e.target.value)}
            min={0}
            step={0.5}
            className="w-20"
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
            onClick={handleConfirmHours}
            disabled={isCompleting}
            className="text-xs text-[#555] hover:text-white"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
