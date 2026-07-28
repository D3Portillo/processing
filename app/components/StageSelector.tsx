"use client";

import { useTransition } from "react";
import { FormControl, Select, MenuItem } from "@mui/material";
import { updateStageAction } from "@/app/lib/actions";
import type { Stage } from "@/app/lib/types";
import { STAGES } from "@/app/lib/types";

export function StageSelector({ fileId, currentStage, actorId }: { fileId: string; currentStage: Stage; actorId: string }) {
  const [transitioning, startTransition] = useTransition();

  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <Select
        value={currentStage}
        disabled={transitioning}
        onChange={(e) => {
          const stage = e.target.value as Stage;
          if (stage === currentStage) return;
          startTransition(async () => { await updateStageAction(fileId, stage, actorId); });
        }}
      >
        {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </Select>
    </FormControl>
  );
}