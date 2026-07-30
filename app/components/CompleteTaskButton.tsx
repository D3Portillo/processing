"use client";

import { Checkbox } from "@mui/material";
import { completeTask, useStore } from "@/app/lib/mock-data";
import type { Task } from "@/app/lib/types";

export function CompleteTaskButton({ task, actorId }: { task: Task; actorId: string }) {
  useStore();
  const done = task.status === "Completed";

  return (
    <Checkbox
      checked={done}
      disabled={done}
      size="small"
      onChange={() => {
        if (done) return;
        completeTask(task.id, actorId);
      }}
      sx={{ p: 0.5 }}
    />
  );
}