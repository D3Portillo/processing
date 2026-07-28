"use client";

import { useTransition } from "react";
import { Checkbox } from "@carbon/react";
import { completeTaskAction } from "@/app/lib/actions";
import type { Task } from "@/app/lib/types";

export function CompleteTaskButton({ task, actorId }: { task: Task; actorId: string }) {
  const [transitioning, startTransition] = useTransition();
  const done = task.status === "Completed";

  return (
    <Checkbox
      id={`task-${task.id}`}
      checked={done}
      disabled={done || transitioning}
      onChange={() => {
        if (done) return;
        startTransition(async () => {
          await completeTaskAction(task.id, actorId);
        });
      }}
      labelText={done ? "Completed" : "Mark complete"}
    />
  );
}