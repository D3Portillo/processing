"use client";

import { useTransition } from "react";
import { Dropdown } from "@carbon/react";
import { updateStageAction } from "@/app/lib/actions";
import type { Stage } from "@/app/lib/types";
import { STAGES } from "@/app/lib/types";

export function StageSelector({ fileId, currentStage, actorId }: { fileId: string; currentStage: Stage; actorId: string }) {
  const [transitioning, startTransition] = useTransition();

  const items = STAGES.map((s) => ({ id: s, label: s }));

  return (
    <Dropdown
      id={`stage-selector-${fileId}`}
      label="Stage"
      items={items}
      selectedItem={{ id: currentStage, label: currentStage }}
      disabled={transitioning}
      onChange={(e: { selectedItem: { id: string } }) => {
        const stage = e.selectedItem.id as Stage;
        if (stage === currentStage) return;
        startTransition(async () => {
          await updateStageAction(fileId, stage, actorId);
        });
      }}
      size="sm"
    />
  );
}