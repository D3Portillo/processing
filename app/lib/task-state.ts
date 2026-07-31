import { atomWithStorage } from "jotai/utils"

export type TaskCompletion = {
  completedAt: string
  completedBy: string
}

export const taskCompletionsAtom = atomWithStorage<Record<string, TaskCompletion>>(
  "processing:task-completions",
  {},
)

export const taskFiltersAtom = atomWithStorage<{
  ownerId: string
  filter: "today" | "tomorrow" | "upcoming" | "overdue"
}>("processing:task-filters", {
  ownerId: "",
  filter: "today",
})

export const fileFiltersAtom = atomWithStorage<{
  ownerId: string
  query: string
}>("processing:file-filters", {
  ownerId: "",
  query: "",
})

export function isTaskCompleted(
  taskId: string,
  status: "Open" | "Completed",
  completions: Record<string, TaskCompletion>,
): boolean {
  return status === "Completed" || Boolean(completions[taskId])
}
