"use client";

import { TaskItem } from "./TaskItem";
import type { Task } from "@/types";

interface TaskListProps {
  tasks: Task[];
  onMutate: () => void;
}

export function TaskList({ tasks, onMutate }: TaskListProps) {
  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  return (
    <div className="space-y-1">
      {tasks.length === 0 ? (
        <div className="rounded-lg bg-[#1a1a1a] p-6 text-center text-sm text-[#555]">
          No tasks yet. Add one below or ask AI for suggestions.
        </div>
      ) : (
        <>
          {incomplete.map((task) => (
            <TaskItem key={task.id} task={task} onMutate={onMutate} />
          ))}
          {completed.length > 0 && (
            <div className="pt-3">
              <p className="text-xs text-[#555] mb-1">
                Completed ({completed.length})
              </p>
              {completed.map((task) => (
                <TaskItem key={task.id} task={task} onMutate={onMutate} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
