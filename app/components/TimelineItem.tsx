import { Avatar } from "@/app/components/ui/avatar";
import { formatDateTime, getInitials } from "@/app/lib/utils";
import type { TimelineEvent } from "@/app/lib/types";
import { CheckCircle2, FileText, MessageSquare, ArrowRightCircle, UserPlus, FileUp, FolderOpen } from "lucide-react";

const EVENT_ICONS = {
  task_completed: CheckCircle2,
  task_created: CheckCircle2,
  note_added: MessageSquare,
  stage_changed: ArrowRightCircle,
  file_assigned: UserPlus,
  document_uploaded: FileUp,
  file_created: FolderOpen,
} as const;

const EVENT_COLORS = {
  task_completed: "text-success",
  task_created: "text-muted-foreground",
  note_added: "text-muted-foreground",
  stage_changed: "text-brand",
  file_assigned: "text-muted-foreground",
  document_uploaded: "text-muted-foreground",
  file_created: "text-muted-foreground",
} as const;

export function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = EVENT_ICONS[event.type] ?? FileText;
  const color = EVENT_COLORS[event.type] ?? "text-muted-foreground";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`p-1.5 rounded-full bg-muted ${color}`}>
          <Icon className="size-3.5" />
        </div>
        <div className="w-px flex-1 bg-border" />
      </div>
      <div className="pb-6 flex-1">
        <p className="text-sm font-medium">{event.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="size-5 text-[10px]">{getInitials(event.actor.name)}</Avatar>
          <span className="text-xs text-muted-foreground">{event.actor.name}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{formatDateTime(event.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}