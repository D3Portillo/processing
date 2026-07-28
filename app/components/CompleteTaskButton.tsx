"use client";

import { useTransition } from "react";
import { Checkbox } from "@mui/material";
import { completeTaskAction } from "@/app/lib/actions";
import type { Task } from "@/app/lib/types";

export function CompleteTaskButton({ task, actorId }: { task: Task; actorId: string }) {
  const [transitioning, startTransition] = useTransition();
  const done = task.status === "Completed";

  return (
    <Checkbox
      checked={done}
      disabled={done || transitioning}
      size="small"
      onChange={() => {
        if (done) return;
        startTransition(async () => { await completeTaskAction(task.id, actorId); });
      }}
      sx={{ p: 0.5 }}
    />
  );
}