"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Box, Typography, Chip, FormControl, Select, MenuItem } from "@mui/material";
import type { Task, MortgageFile, TaskFilter } from "@/app/lib/types";
import { formatRelative, isOverdue, isToday, isTomorrow } from "@/app/lib/utils";

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: "today", label: "Due Today" },
  { value: "overdue", label: "Overdue" },
  { value: "tomorrow", label: "Due Tomorrow" },
  { value: "upcoming", label: "Upcoming" },
  { value: "all", label: "All Tasks" },
];

type ScopeOption = "mine" | "all";

function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  switch (filter) {
    case "overdue": return tasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate));
    case "today": return tasks.filter((t) => t.dueDate && isToday(t.dueDate));
    case "tomorrow": return tasks.filter((t) => t.dueDate && isTomorrow(t.dueDate));
    case "upcoming": return tasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate));
    case "all":
    default:
      return tasks;
  }
}

export function TaskList({ tasks, fileMap, currentSpecialistId }: { tasks: Task[]; fileMap: Map<string, MortgageFile>; currentSpecialistId: string }) {
  const [filter, setFilter] = useState<TaskFilter>("today");
  const [scope, setScope] = useState<ScopeOption>("mine");

  const scoped = useMemo(() => {
    if (scope === "mine") return tasks.filter((t) => t.assignedTo.id === currentSpecialistId);
    return tasks;
  }, [tasks, scope]);

  const filtered = useMemo(() => filterTasks(scoped, filter), [scoped, filter]);

  const myTasks = useMemo(() => tasks.filter((t) => t.assignedTo.id === currentSpecialistId), [tasks, currentSpecialistId]);
  const myOverdueCount = useMemo(() => myTasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate)).length, [myTasks]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scoped.length };
    c.overdue = scoped.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate)).length;
    c.today = scoped.filter((t) => t.dueDate && isToday(t.dueDate)).length;
    c.tomorrow = scoped.filter((t) => t.dueDate && isTomorrow(t.dueDate)).length;
    c.upcoming = scoped.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate)).length;
    return c;
  }, [scoped]);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 170 }}>
          <Select
            value={scope}
            onChange={(e) => setScope(e.target.value as ScopeOption)}
          >
            <MenuItem value="mine">Assigned to Me</MenuItem>
            <MenuItem value="all">All Tasks</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TaskFilter)}
          >
            {FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label} ({counts[opt.value] || 0})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {myOverdueCount > 0 && (
          <Chip
            label={`${myOverdueCount} overdue`}
            color="error"
            size="small"
            clickable
            onClick={() => { setScope("mine"); setFilter("overdue"); }}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No tasks in this view
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {filtered.map((task, index) => {
            const file = fileMap.get(task.fileId);
            const overdue = task.dueDate && isOverdue(task.dueDate) && !isToday(task.dueDate);
            const priorityColor = task.priority === "High" ? "error" : task.priority === "Medium" ? "warning" : "default";

            return (
              <Link key={task.id} href={`/files/${task.fileId}`} style={{ textDecoration: "none" }}>
                <Box sx={{
                  display: "flex", alignItems: "flex-start", gap: 1.5, p: 1.5, borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: index % 2 === 0 ? "rgba(0,0,0,0.025)" : "transparent",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
                }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.title}</Typography>
                    {file && (
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.25 }}>
                        {file.borrower.name} — {file.lender.name}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 1.5, mt: 0.75, alignItems: "center" }}>
                      <Chip label={task.priority} size="small" color={priorityColor as "error" | "warning" | "default"} variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                      {task.dueDate && (
                        <Typography variant="caption" color={overdue ? "error" : "text.secondary"} sx={{ fontWeight: overdue ? 600 : 400 }}>
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