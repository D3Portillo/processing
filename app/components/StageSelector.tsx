"use client";

import { useTransition } from "react";
import { updateStageAction } from "@/app/lib/actions";
import type { Stage } from "@/app/lib/types";
import { STAGES } from "@/app/lib/types";

export function StageSelector({ fileId, currentStage, actorId }: { fileId: string; currentStage: Stage; actorId: string }) {
  const [transitioning, startTransition] = useTransition();

  return (
    <select
      value={currentStage}
      disabled={transitioning}
      onChange={(e) => {
        const stage = e.target.value as Stage;
        if (stage === currentStage) return;
        startTransition(async () => {
          await updateStageAction(fileId, stage, actorId);
        });
      }}
      className="flex h-9 w-auto rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}