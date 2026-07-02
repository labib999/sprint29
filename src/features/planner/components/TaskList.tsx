"use client";

import { sortByPriority } from "@/features/planner/lib/priorityCalculator";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
  onMutate: () => void;
}

export function TaskList({ tasks, onMutate }: TaskListProps) {
  const sorted = sortByPriority(tasks);
  const incomplete = sorted.filter((t) => !t.completed);
  const completed = sorted.filter((t) => t.completed);

  const totalPlanned = tasks.reduce((s, t) => s + t.estimated_hours, 0);
  const totalCompleted = completed.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {totalCompleted}/{tasks.length} tasks
        </span>
        <span>{totalPlanned}h planned</span>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          No tasks yet. Add one below or ask AI for suggestions.
        </div>
      ) : (
        <div className="space-y-2">
          {incomplete.map((task) => (
            <TaskItem key={task.id} task={task} onMutate={onMutate} />
          ))}
          {completed.length > 0 && (
            <>
              <div className="border-t border-gray-100 pt-3 mt-4">
                <p className="text-xs text-gray-400 mb-2">Completed</p>
              </div>
              {completed.map((task) => (
                <TaskItem key={task.id} task={task} onMutate={onMutate} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
