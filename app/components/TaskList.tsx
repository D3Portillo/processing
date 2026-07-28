"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/app/components/ui/badge";
import type { Task, MortgageFile, TaskFilter } from "@/app/lib/types";
import { formatRelative, isOverdue, isToday, isTomorrow } from "@/app/lib/utils";

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: "today", label: "Due Today" },
  { value: "overdue", label: "Overdue" },
  { value: "tomorrow", label: "Due Tomorrow" },
  { value: "upcoming", label: "Upcoming" },
  { value: "no-due-date", label: "No Due Date" },
  { value: "all", label: "All Tasks" },
];

function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "overdue":
      return tasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate));
    case "today":
      return tasks.filter((t) => t.dueDate && isToday(t.dueDate));
    case "tomorrow":
      return tasks.filter((t) => t.dueDate && isTomorrow(t.dueDate));
    case "upcoming":
      return tasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate));
    case "no-due-date":
      return tasks.filter((t) => !t.dueDate);
    case "all":
    default:
      return tasks;
  }
}

export function TaskList({ tasks, fileMap }: { tasks: Task[]; fileMap: Map<string, MortgageFile> }) {
  const [filter, setFilter] = useState<TaskFilter>("today");

  const filtered = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const counts = useMemo(() => {
    const c: Record<TaskFilter, number> = { all: 0, overdue: 0, today: 0, tomorrow: 0, upcoming: 0, "no-due-date": 0 };
    c.all = tasks.length;
    c.overdue = tasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate)).length;
    c.today = tasks.filter((t) => t.dueDate && isToday(t.dueDate)).length;
    c.tomorrow = tasks.filter((t) => t.dueDate && isTomorrow(t.dueDate)).length;
    c.upcoming = tasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate)).length;
    c["no-due-date"] = tasks.filter((t) => !t.dueDate).length;
    return c;
  }, [tasks]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TaskFilter)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({counts[opt.value]})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No tasks in this view</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((task) => {
            const file = fileMap.get(task.fileId);
            const overdue = task.dueDate && isOverdue(task.dueDate) && !isToday(task.dueDate);
            const priorityColor =
              task.priority === "High" ? "text-destructive" :
              task.priority === "Medium" ? "text-warning" :
              "text-muted-foreground";

            return (
              <Link key={task.id} href={`/files/${task.fileId}`}>
                <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    {file && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {file.borrower.name} — {file.lender.name}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-medium ${priorityColor}`}>{task.priority}</span>
                      {task.dueDate && (
                        <span className={`text-xs ${overdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                          {overdue ? "Overdue · " : ""}{formatRelative(task.dueDate)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
                    </div>
                  </div>
                  {file && <Badge variant="secondary">{file.stage}</Badge>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}