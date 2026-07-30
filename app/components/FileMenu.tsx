"use client";

import { useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { ChevronDown, ArrowRight, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { updateFileStage, useStore } from "@/app/lib/mock-data";
import type { Stage } from "@/app/lib/types";
import { STAGES } from "@/app/lib/types";

export function FileMenu({ fileId, currentStage, actorId }: { fileId: string; currentStage: Stage; actorId: string }) {
  useStore();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [statusSubmenu, setStatusSubmenu] = useState<HTMLElement | null>(null);

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
          fontWeight: 600,
          color: "text.primary",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          px: 1.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        Actions
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => { setAnchorEl(null); setStatusSubmenu(null); }}>
        <MenuItem onClick={(e) => setStatusSubmenu(e.currentTarget)}>
          <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
            <RefreshCw size={16} />
          </ListItemIcon>
          <ListItemText primary="Change Status" />
        </MenuItem>
        {statusSubmenu && (
          <Menu
            anchorEl={statusSubmenu}
            open={Boolean(statusSubmenu)}
            onClose={() => setStatusSubmenu(null)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {nextStages.length === 0 ? (
              <MenuItem disabled>
                <ListItemText>No further stages</ListItemText>
              </MenuItem>
            ) : (
              nextStages.map((stage) => (
                <MenuItem
                  key={stage}
                  onClick={() => {
                    setStatusSubmenu(null);
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
        )}
        <Divider />
        <MenuItem>
          <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
            <Mail size={16} />
          </ListItemIcon>
          <ListItemText primary="Send Email" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
            <MessageSquare size={16} />
          </ListItemIcon>
          <ListItemText primary="Send SMS" />
        </MenuItem>
      </Menu>
    </>
  );
}