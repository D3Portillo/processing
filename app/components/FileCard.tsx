import Link from "next/link";
import { Card, CardContent } from "@/app/components/ui/card";
import { StageBadge } from "./StageBadge";
import { Avatar } from "@/app/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import type { MortgageFile, Task } from "@/app/lib/types";
import { formatDate, formatRelative, getInitials, isOverdue } from "@/app/lib/utils";

// ─── File Card ───────────────────────────────────────────────
// Used in dashboard lists and file browse views.

export function FileCard({ file }: { file: MortgageFile }) {
  return (
    <Link href={`/files/${file.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{file.borrower.name}</p>
              <p className="text-sm text-muted-foreground truncate">{file.lender.name}</p>
            </div>
            <StageBadge stage={file.stage} />
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" />
              {file.specialist.name}
            </span>
            {file.saleDate && (
              <span className={`flex items-center gap-1.5 ${isOverdue(file.saleDate) ? "text-destructive font-medium" : ""}`}>
                <Calendar className="size-3.5" />
                {formatRelative(file.saleDate)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Task Row ────────────────────────────────────────────────
// Shows a single task with priority, due date, and file link.

export function TaskRow({ task, showFile = false, file }: { task: Task; showFile?: boolean; file?: MortgageFile }) {
  const overdue = task.dueDate && task.status === "Open" && isOverdue(task.dueDate);

  const priorityColor = task.priority === "High" ? "text-destructive" : task.priority === "Medium" ? "text-warning" : "text-muted-foreground";

  return (
    <Link href={`/files/${task.fileId}`}>
      <div className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === "Completed" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </p>
          {showFile && file && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {file.borrower.name} — {file.lender.name}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-xs font-medium ${priorityColor}`}>{task.priority}</span>
            {task.dueDate && (
              <span className={`text-xs ${overdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                {overdue ? "Overdue · " : ""}{formatRelative(task.dueDate)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Sale Date Card ──────────────────────────────────────────
export function SaleDateCard({ file }: { file: MortgageFile }) {
  const overdue = file.saleDate && isOverdue(file.saleDate);
  return (
    <Link href={`/files/${file.id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{file.borrower.name}</p>
              <p className="text-sm text-muted-foreground truncate">{file.lender.name}</p>
            </div>
            <div className={`text-right shrink-0`}>
              <p className={`text-sm font-bold ${overdue ? "text-destructive" : ""}`}>
                {file.saleDate ? formatDate(file.saleDate) : "—"}
              </p>
              <p className="text-xs text-muted-foreground">{file.stage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}