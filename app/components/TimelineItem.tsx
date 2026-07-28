import { Box, Typography, Avatar } from "@mui/material";
import { CheckCircle2, FileText, MessageSquare, ArrowRightCircle, UserPlus, FileUp, FolderOpen } from "lucide-react";
import { formatDateTime, getInitials } from "@/app/lib/utils";
import type { TimelineEvent } from "@/app/lib/types";

const EVENT_ICONS = {
  task_completed: CheckCircle2,
  task_created: CheckCircle2,
  note_added: MessageSquare,
  stage_changed: ArrowRightCircle,
  file_assigned: UserPlus,
  document_uploaded: FileUp,
  file_created: FolderOpen,
} as const;

export function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = EVENT_ICONS[event.type] ?? FileText;
  return (
    <Box sx={{ display: "flex", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ p: 1, borderRadius: "50%", bgcolor: "action.hover" }}>
          <Icon size={14} />
        </Box>
        <Box sx={{ width: "1px", flex: 1, bgcolor: "divider", minHeight: 24 }} />
      </Box>
      <Box sx={{ pb: 3, flex: 1 }}>
        <Typography variant="body2" fontWeight={500}>{event.description}</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 0.5, alignItems: "center" }}>
          <Avatar sx={{ width: 20, height: 20, fontSize: "0.6rem" }}>{getInitials(event.actor.name)}</Avatar>
          <Typography variant="caption" color="text.secondary">{event.actor.name}</Typography>
          <Typography variant="caption" color="text.secondary">·</Typography>
          <Typography variant="caption" color="text.secondary">{formatDateTime(event.createdAt)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}