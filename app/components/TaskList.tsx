"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Box, Typography, Chip, FormControl, Select, MenuItem, Avatar } from "@mui/material";
import type { Task, MortgageFile, TaskFilter } from "@/app/lib/types";
import { colorFromString, formatRelative, getInitials, isOverdue, isToday, isTomorrow } from "@/app/lib/utils";
import { PROCESSING_TEAM } from "@/app/lib/sf-leads";
import { useAtom, useAtomValue } from "jotai";
import { isTaskCompleted, taskCompletionsAtom, taskFiltersAtom } from "@/app/lib/task-state";

const FILTER_OPTIONS: { value: TaskFilter; label: string }[] = [
  { value: "today", label: "Due Today" },
  { value: "tomorrow", label: "Due Tomorrow" },
  { value: "upcoming", label: "Upcoming" },
  { value: "overdue", label: "Overdue" },
];

const ALL_PEOPLE = "all";
const UNASSIGNED = "unassigned";

function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  const openTasks = tasks.filter((task) => task.status === "Open")

  switch (filter) {
    case "overdue": return openTasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate));
    case "today": return openTasks.filter((t) => t.dueDate && isToday(t.dueDate));
    case "tomorrow": return openTasks.filter((t) => t.dueDate && isTomorrow(t.dueDate));
    case "upcoming": return openTasks.filter((t) => t.dueDate && !isOverdue(t.dueDate) && !isToday(t.dueDate) && !isTomorrow(t.dueDate));
    case "all":
    default:
      return openTasks;
  }
}

export function TaskList({ tasks, fileMap, currentSpecialistId }: { tasks: Task[]; fileMap: Map<string, MortgageFile>; currentSpecialistId: string }) {
  const [filters, setFilters] = useAtom(taskFiltersAtom);
  const filter = filters.filter;
  const ownerId = filters.ownerId || currentSpecialistId;
  const completions = useAtomValue(taskCompletionsAtom);

  const scoped = useMemo(() => {
    const openTasks = tasks.filter(
      (task) => !isTaskCompleted(task.id, task.status, completions),
    );
    if (ownerId === UNASSIGNED) return openTasks.filter((task) => !task.assignedTo.id);
    if (ownerId !== ALL_PEOPLE) return openTasks.filter((task) => task.assignedTo.id === ownerId);
    return openTasks;
  }, [tasks, ownerId, completions]);

  const filtered = useMemo(() => filterTasks(scoped, filter), [scoped, filter]);

  const myTasks = useMemo(() => tasks.filter((task) => !isTaskCompleted(task.id, task.status, completions) && task.assignedTo.id === currentSpecialistId), [tasks, currentSpecialistId, completions]);
  const myOverdueCount = useMemo(() => myTasks.filter((t) => t.dueDate && isOverdue(t.dueDate) && !isToday(t.dueDate)).length, [myTasks]);

  const counts = useMemo(() => {
    const openScoped = scoped.filter((task) => task.status === "Open");
    const c: Record<string, number> = { all: openScoped.length };
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
            value={ownerId || ALL_PEOPLE}
            onChange={(e) => setFilters((current) => ({ ...current, ownerId: e.target.value }))}
            renderValue={(selected) => {
              const owner = PROCESSING_TEAM.find((item) => item.Id === selected);
              const label = owner?.Name ?? (selected === UNASSIGNED ? "Unassigned" : "Everyone");
              return <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: owner ? colorFromString(owner.Id) : selected === UNASSIGNED ? "grey.400" : "primary.main" }}>{getInitials(selected === currentSpecialistId ? "Me" : label)}</Avatar>{selected === currentSpecialistId ? "Me" : label}</Box>;
            }}
          >
            <MenuItem value={currentSpecialistId || ALL_PEOPLE}><Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: "0.6rem", bgcolor: colorFromString(currentSpecialistId) }}>{getInitials("Me")}</Avatar>Me</MenuItem>
            {PROCESSING_TEAM.filter((owner) => owner.Id !== currentSpecialistId).map((owner) => <MenuItem key={owner.Id} value={owner.Id}><Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: "0.6rem", bgcolor: colorFromString(owner.Id) }}>{getInitials(owner.Name)}</Avatar>{owner.Name}</MenuItem>)}
            <MenuItem value={UNASSIGNED}>Unassigned</MenuItem>
            <MenuItem value={ALL_PEOPLE}>Everyone</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={filter}
            onChange={(e) => setFilters((current) => ({ ...current, filter: e.target.value as "today" | "tomorrow" | "upcoming" | "overdue" }))}
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
            onClick={() => setFilters((current) => ({ ...current, ownerId: currentSpecialistId, filter: "overdue" }))}
            sx={{ fontWeight: 500 }}
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