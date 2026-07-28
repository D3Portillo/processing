import {
  Checkmark,
  Warning,
  ArrowRight,
  User as UserIcon,
  Document as DocumentIcon,
  Add as AddIcon,
  Notebook,
} from "@carbon/icons-react";
import { formatDateTime, getInitials } from "@/app/lib/utils";
import type { TimelineEvent } from "@/app/lib/types";

const EVENT_ICONS = {
  task_completed: Checkmark,
  task_created: AddIcon,
  note_added: Notebook,
  stage_changed: ArrowRight,
  file_assigned: UserIcon,
  document_uploaded: DocumentIcon,
  file_created: Notebook,
} as const;

export function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = EVENT_ICONS[event.type] ?? Warning;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="p-1.5 rounded-full bg-[var(--cds--layer-02)]">
          <Icon size={14} />
        </div>
        <div className="w-px flex-1 bg-[var(--cds--border-subtle)]" />
      </div>
      <div className="pb-6 flex-1">
        <p className="text-sm font-medium">{event.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="cds--avatar size-5 text-[10px] flex items-center justify-center rounded-full bg-[var(--cds--layer-02)]">
            {getInitials(event.actor.name)}
          </span>
          <span className="text-xs text-[var(--cds--text-secondary)]">{event.actor.name}</span>
          <span className="text-xs text-[var(--cds--text-secondary)]">·</span>
          <span className="text-xs text-[var(--cds--text-secondary)]">{formatDateTime(event.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}