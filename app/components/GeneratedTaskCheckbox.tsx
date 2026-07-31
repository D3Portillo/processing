"use client"

import { Checkbox } from "@mui/material"
import { useAtom } from "jotai"
import { isTaskCompleted, taskCompletionsAtom } from "@/app/lib/task-state"
import type { Task } from "@/app/lib/types"

export function GeneratedTaskCheckbox({
  task,
  actorId,
}: {
  task: Task
  actorId: string
}) {
  const [completions, setCompletions] = useAtom(taskCompletionsAtom)
  const completed = isTaskCompleted(task.id, task.status, completions)

  return (
    <Checkbox
      checked={completed}
      size="small"
      onClick={(event) => event.stopPropagation()}
      onChange={() => {
        if (completed) return
        setCompletions((current) => ({
          ...current,
          [task.id]: {
            completedAt: new Date().toISOString(),
            completedBy: actorId,
          },
        }))
      }}
      sx={{ p: 0.5 }}
    />
  )
}
