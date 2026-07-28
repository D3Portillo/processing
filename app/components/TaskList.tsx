"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Box, Typography, Chip, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
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
    case "overdue": return tasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate));
    case "today": return tasks.filter((t) => t.dueDate && isToday(t.dueDate));
    case "tomorrow": return tasks.filter((t) => t.dueDate && isTomorrow(t.dueDate));
    case "upcoming": return tasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate));
    case "no-due-date": return tasks.filter((t) => !t.dueDate);
    default: return tasks;
  }
}

export function TaskList({ tasks, fileMap }: { tasks: Task[]; fileMap: Map<string, MortgageFile> }) {
  const [filter, setFilter] = useState<TaskFilter>("today");

  const filtered = useMemo(() => filterTasks(tasks, filter), [tasks, filter]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.length };
    c.overdue = tasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate)).length;
    c.today = tasks.filter((t) => t.dueDate && isToday(t.dueDate)).length;
    c.tomorrow = tasks.filter((t) => t.dueDate && isTomorrow(t.dueDate)).length;
    c.upcoming = tasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate)).length;
    c["no-due-date"] = tasks.filter((t) => !t.dueDate).length;
    return c;
  }, [tasks]);

  return (
    <Box>
      <FormControl size="small" sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Filter</InputLabel>
        <Select
          value={filter}
          label="Filter"
          onChange={(e) => setFilter(e.target.value as TaskFilter)}
        >
          {FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label} ({counts[opt.value] || 0})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No tasks in this view
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {filtered.map((task) => {
            const file = fileMap.get(task.fileId);
            const overdue = task.dueDate && isOverdue(task.dueDate) && !isToday(task.dueDate);
            const priorityColor = task.priority === "High" ? "error" : task.priority === "Medium" ? "warning" : "default";

            return (
              <Link key={task.id} href={`/files/${task.fileId}`} style={{ textDecoration: "none" }}>
                <Box sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.5, p: 1.5, borderRadius: 1,
                  cursor: "pointer", "&:hover": { bgcolor: "action.hover" },
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500}>{task.title}</Typography>
                    {file && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.25 }}>
                        {file.borrower.name} — {file.lender.name}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 1.5, mt: 0.75, alignItems: "center" }}>
                      <Chip label={task.priority} size="small" color={priorityColor as "error" | "warning" | "default"} variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                      {task.dueDate && (
                        <Typography variant="caption" color={overdue ? "error" : "text.secondary"} fontWeight={overdue ? 600 : 400}>
                          {overdue ? `Overdue · ${formatRelative(task.dueDate)}` : formatRelative(task.dueDate)}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">{task.assignedTo.name}</Typography>
                    </Box>
                  </Box>
                  {file && <Chip label={file.stage} size="small" variant="outlined" />}
                </Box>
              </Link>
            );
          })}
        </Box>
      )}
    </Box>
  );
}