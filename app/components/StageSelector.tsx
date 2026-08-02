"use client";

import { useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { ChevronDown, ArrowRight } from "lucide-react";
import { updateFileStage, useStore } from "@/app/lib/ui-actions";
import type { Stage } from "@/app/lib/types";
import { STAGES } from "@/app/lib/types";

export function StageSelector({ fileId, currentStage, actorId }: { fileId: string; currentStage: Stage; actorId: string }) {
  useStore();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const currentIndex = STAGES.indexOf(currentStage);
  const nextStages = STAGES.filter((_, i) => i > currentIndex);

  return (
    <>
      <Button
        size="small"
        endIcon={<ChevronDown size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          textTransform: "none",
          fontWeight: 500,
          color: "text.primary",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          px: 1.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        Change Status
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {nextStages.length === 0 ? (
          <MenuItem disabled>
            <ListItemText>No further stages</ListItemText>
          </MenuItem>
        ) : (
          nextStages.map((stage) => (
            <MenuItem
              key={stage}
              onClick={() => {
                setAnchorEl(null);
                updateFileStage(fileId, stage, actorId);
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
                <ArrowRight size={16} />
              </ListItemIcon>
              <ListItemText primary={stage} />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}