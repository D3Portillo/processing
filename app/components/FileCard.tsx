import Link from "next/link";
import { Card, CardContent, Box, Typography } from "@mui/material";
import { Calendar, User } from "lucide-react";
import type { MortgageFile, Task } from "@/app/lib/types";
import { formatDate, formatRelative, isOverdue } from "@/app/lib/utils";
import { StageBadge } from "./StageBadge";

export function FileCard({ file }: { file: MortgageFile }) {
  return (
    <Link href={`/files/${file.id}`} style={{ textDecoration: "none" }}>
      <Card variant="outlined" sx={{ height: "100%", cursor: "pointer", transition: "box-shadow 0.2s", "&:hover": { boxShadow: 3 } }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 500 }}>{file.borrower.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{file.lender.name}</Typography>
            </Box>
            <StageBadge stage={file.stage} />
          </Box>
          <Box sx={{ display: "flex", gap: 2, mt: 1.5, color: "text.secondary" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <User size={14} />
              <Typography variant="caption">{file.specialist ? file.specialist.name : "Unassigned"}</Typography>
            </Box>
            {file.saleDate && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Calendar size={14} />
                <Typography variant="caption" color={isOverdue(file.saleDate) ? "error" : "text.secondary"} sx={{ fontWeight: isOverdue(file.saleDate) ? 600 : 400 }}>
                  {formatRelative(file.saleDate)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TaskRow({ task, showFile = false, file }: { task: Task; showFile?: boolean; file?: MortgageFile }) {
  const overdue = task.dueDate && task.status === "Open" && isOverdue(task.dueDate);

  return (
    <Link href={`/files/${task.fileId}`} style={{ textDecoration: "none" }}>
      <Box sx={{
        display: "flex", alignItems: "flex-start", gap: 1.5, p: 1.5, borderRadius: 1,
        cursor: "pointer", "&:hover": { bgcolor: "action.hover" },
      }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            
            sx={task.status === "Completed" ? { textDecoration: "line-through", color: "text.secondary", fontWeight: 500} : {}}
          >
            {task.title}
          </Typography>
          {showFile && file && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.25 }}>
              {file.borrower.name} — {file.lender.name}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 1.5, mt: 0.75, alignItems: "center" }}>
            {task.dueDate && (
              <Typography variant="caption" color={overdue ? "error" : "text.secondary"} sx={{ fontWeight: overdue ? 600 : 400 }}>
                {overdue ? `Overdue · ${formatRelative(task.dueDate)}` : formatRelative(task.dueDate)}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">{task.assignedTo.name}</Typography>
          </Box>
        </Box>
        {file && <StageBadge stage={file.stage} />}
      </Box>
    </Link>
  );
}

export function SaleDateCard({ file }: { file: MortgageFile }) {
  const overdue = file.saleDate && isOverdue(file.saleDate);
  return (
    <Link href={`/files/${file.id}`} style={{ textDecoration: "none" }}>
      <Card variant="outlined" sx={{ cursor: "pointer", transition: "box-shadow 0.2s", "&:hover": { boxShadow: 3 } }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 500 }}>{file.borrower.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{file.lender.name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", mt: 0.5 }}>{file.borrower.propertyAddress}</Typography>
            </Box>
            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5 }}>
                <Calendar size={14} />
                <Typography variant="body2" color={overdue ? "error" : "text.primary"} sx={{ fontWeight: 500 }}>
                  {file.saleDate ? formatDate(file.saleDate) : "—"}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                {file.saleDate ? formatRelative(file.saleDate) : ""}
              </Typography>
              <Box sx={{ mt: 0.75 }}><StageBadge stage={file.stage} /></Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}