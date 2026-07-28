"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tag, Dropdown } from "@carbon/react";
import type { Task, MortgageFile, TaskFilter } from "@/app/lib/types";
import { formatRelative, isOverdue, isToday, isTomorrow } from "@/app/lib/utils";

const FILTER_OPTIONS = [
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
    const c: Record<string, number> = {};
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
      <div className="mb-4">
        <Dropdown
          id="task-filter"
          label="Filter tasks"
          items={FILTER_OPTIONS.map((opt) => ({
            id: opt.value,
            label: `${opt.label} (${counts[opt.value] || 0})`,
          }))}
          selectedItem={{
            id: filter,
            label: `${FILTER_OPTIONS.find((o) => o.value === filter)?.label} (${counts[filter] || 0})`,
          }}
          onChange={(e: { selectedItem: { id: string } }) => setFilter(e.selectedItem.id as TaskFilter)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--cds--text-secondary)] py-8 text-center">No tasks in this view</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((task) => {
            const file = fileMap.get(task.fileId);
            const overdue = task.dueDate && isOverdue(task.dueDate) && !isToday(task.dueDate);
            const priorityType = task.priority === "High" ? "red" : task.priority === "Medium" ? "yellow" : "gray";

            return (
              <Link key={task.id} href={`/files/${task.fileId}`} className="block">
                <div className="flex items-start gap-3 p-3 rounded-md hover:bg-[var(--cds--layer-hover)] transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{task.title}</p>
                    {file && (
                      <p className="text-xs text-[var(--cds--text-secondary)] mt-0.5 truncate">
                        {file.borrower.name} — {file.lender.name}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <Tag type={priorityType as "red" | "yellow" | "gray"} size="sm">{task.priority}</Tag>
                      {task.dueDate && (
                        <span className={`text-xs ${overdue ? "text-[var(--cds--text-error)] font-semibold" : "text-[var(--cds--text-secondary)]"}`}>
                          {overdue ? "Overdue · " : ""}{formatRelative(task.dueDate)}
                        </span>
                      )}
                      <span className="text-xs text-[var(--cds--text-secondary)]">{task.assignedTo.name}</span>
                    </div>
                  </div>
                  {file && <Tag size="sm">{file.stage}</Tag>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}