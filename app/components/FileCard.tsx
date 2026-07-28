import Link from "next/link";
import { Tag } from "@carbon/react";
import { Calendar, User, Building } from "@carbon/icons-react";
import type { MortgageFile, Task } from "@/app/lib/types";
import { formatDate, formatRelative, isOverdue } from "@/app/lib/utils";
import { StageBadge } from "./StageBadge";

export function FileCard({ file }: { file: MortgageFile }) {
  return (
    <Link href={`/files/${file.id}`} className="block">
      <div className="cds--tile cds--tile--clickable p-4 hover:cds--tile--clickable--hover">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{file.borrower.name}</p>
            <p className="text-sm text-[var(--cds--text-secondary)] truncate">{file.lender.name}</p>
          </div>
          <StageBadge stage={file.stage} />
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-[var(--cds--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <User size={14} />
            {file.specialist.name}
          </span>
          {file.saleDate && (
            <span className={`flex items-center gap-1.5 ${isOverdue(file.saleDate) ? "text-[var(--cds--text-error)] font-medium" : ""}`}>
              <Calendar size={14} />
              {formatRelative(file.saleDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function TaskRow({ task, showFile = false, file }: { task: Task; showFile?: boolean; file?: MortgageFile }) {
  const overdue = task.dueDate && task.status === "Open" && isOverdue(task.dueDate);
  const priorityType = task.priority === "High" ? "red" : task.priority === "Medium" ? "yellow" : "gray";

  return (
    <Link href={`/files/${task.fileId}`} className="block">
      <div className="flex items-start gap-3 p-3 rounded-md hover:bg-[var(--cds--layer-hover)] transition-colors cursor-pointer">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === "Completed" ? "line-through text-[var(--cds--text-secondary)]" : ""}`}>
            {task.title}
          </p>
          {showFile && file && (
            <p className="text-xs text-[var(--cds--text-secondary)] mt-0.5 truncate">
              {file.borrower.name} — {file.lender.name}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <Tag type={priorityType as "red" | "yellow" | "gray"} size="sm">{task.priority}</Tag>
            {task.dueDate && (
              <span className={`text-xs ${overdue ? "text-[var(--cds--text-error)] font-semibold" : "text-[var(--cds--text-secondary)]"}`}>
                {overdue ? "Overdue · " : ""}{formatRelative(task.dueDate)}
              </span>
            )}
            <span className="text-xs text-[var(--cds--text-secondary)]">{task.assignedTo.name}</span>
          </div>
        </div>
        {file && <Tag size="sm">{file.stage}</Tag>}
      </div>
    </Link>
  );
}

export function SaleDateCard({ file }: { file: MortgageFile }) {
  const overdue = file.saleDate && isOverdue(file.saleDate);
  return (
    <Link href={`/files/${file.id}`} className="block">
      <div className="cds--tile p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{file.borrower.name}</p>
            <p className="text-sm text-[var(--cds--text-secondary)] truncate">{file.lender.name}</p>
            <p className="text-xs text-[var(--cds--text-secondary)] mt-1 truncate">{file.borrower.propertyAddress}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1.5">
              <Calendar size={14} className={overdue ? "text-[var(--cds--text-error)]" : "text-[var(--cds--text-secondary)]"} />
              <p className={`text-sm font-bold ${overdue ? "text-[var(--cds--text-error)]" : ""}`}>
                {file.saleDate ? formatDate(file.saleDate) : "—"}
              </p>
            </div>
            <p className="text-xs text-[var(--cds--text-secondary)] mt-0.5">
              {file.saleDate ? formatRelative(file.saleDate) : ""}
            </p>
            <div className="mt-1.5">
              <StageBadge stage={file.stage} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}