"use client"

import { useState } from "react"
import { Checkbox } from "@mui/material"
import type { Task } from "@/app/lib/types"

export function CompleteTaskButton({ task }: { task: Task; actorId: string }) {
  const [done, setDone] = useState(task.status === "Completed")

  return (
    <Checkbox
      checked={done}
      disabled={done}
      size="small"
      onChange={() => setDone(true)}
      sx={{ p: 0.5 }}
    />
  )
}