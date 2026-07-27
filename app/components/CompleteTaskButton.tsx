"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { completeTaskAction } from "@/app/lib/actions";
import { cn } from "@/app/lib/utils";
import type { Task } from "@/app/lib/types";

export function CompleteTaskButton({ task, actorId }: { task: Task; actorId: string }) {
  const [transitioning, startTransition] = useTransition();
  const done = task.status === "Completed";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (done) return;
        startTransition(async () => {
          await completeTaskAction(task.id, actorId);
        });
      }}
      disabled={done || transitioning}
      className={cn(
        "shrink-0 flex items-center justify-center size-5 rounded-full border-2 transition-colors",
        done ? "bg-success border-success text-white" : "border-muted-foreground/40 hover:border-success hover:bg-success/10",
        transitioning && "opacity-50"
      )}
      aria-label={done ? "Completed" : "Mark complete"}
    >
      {done && <Check className="size-3" />}
    </button>
  );
}