"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Alert,
  CircularProgress,
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Button,
} from "@mui/material"
import {
  FileText,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  User,
} from "lucide-react"
import { useLeads } from "@/app/hooks/useLeads"
import { useSalesforceUser } from "@/app/hooks/useSalesforceUser"
import { useTasks } from "@/app/hooks/useTasks"
import { useLeadMetadata } from "@/app/hooks/useLeadMetadata"
import { useLeadHistory } from "@/app/hooks/useLeadHistory"
import { useLeadNotes } from "@/app/hooks/useLeadNotes"
import { useLeadFiles } from "@/app/hooks/useLeadFiles"
import type { SalesforceLeadHistory } from "@/app/lib/lead-metadata"
import { mapLeadToMortgageFile } from "@/app/lib/lead-mapper"
import { Nav } from "@/app/components/Nav"
import { FileMenu } from "@/app/components/FileMenu"
import { LenderCard } from "@/app/components/LenderCard"
import { StageBadge } from "@/app/components/StageBadge"
import { FileTabs } from "@/app/components/FileTabs"
import { AddTaskDialog } from "@/app/components/AddTaskDialog"
import { AssignSelector } from "@/app/components/AssignSelector"
import { ALL_USERS } from "@/app/lib/owners"
import { colorFromString, formatDate, formatRelative } from "@/app/lib/utils"
import { GeneratedTaskCheckbox } from "@/app/components/GeneratedTaskCheckbox"
import type { Task } from "@/app/lib/types"

export function LiveFileDetail() {
  const params = useParams<{ fileId: string }>()
  const { data: leads, error, isLoading } = useLeads()
  const { data: connectedUser } = useSalesforceUser()
  const { data: taskRows, isLoading: tasksLoading } = useTasks(params.fileId)
  const { data: leadMetadata } = useLeadMetadata(params.fileId)
  const { data: history, isLoading: historyLoading } = useLeadHistory(
    params.fileId,
  )
  const { data: notes, isLoading: notesLoading } = useLeadNotes(params.fileId)
  const { data: files, isLoading: filesLoading } = useLeadFiles(params.fileId)

  if (isLoading || tasksLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>
  }

  const lead = leads?.find((item) => item.Id === params.fileId)
  if (!lead) {
    return (
      <Alert severity="warning">
        This file was not found in the live Salesforce data.
      </Alert>
    )
  }

  const file = mapLeadToMortgageFile(lead)
  const specialists = ALL_USERS.map((owner) => ({
    id: owner.Id,
    name: owner.Name,
    email: owner.Email ?? "",
    avatarColor: colorFromString(owner.Id),
  }))
  const actor = specialists.find(
    (specialist) =>
      specialist.email.toLowerCase() ===
      connectedUser?.user?.email.toLowerCase(),
  )
  const actorId = actor?.id ?? file.specialist?.id ?? specialists[0]?.id ?? ""
  const ownerMap = new Map(specialists.map((s) => [s.id, s]))
  const generatedTasks: Task[] = (taskRows ?? []).map((row) => ({
    id: row.id,
    fileId: row.file_id,
    title: row.title,
    description: row.note,
    type: row.type,
    assignedTo: ownerMap.get(row.assigned_to) ?? specialists[0],
    dueDate: row.due_date,
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }))
  const openTasks = generatedTasks.filter((task) => task.status === "Open")
  const allHistory = history ?? []
  const allNotes = notes ?? []
  const allFiles = files ?? []
  const taskCounts = {
    tasks: openTasks.length,
    timeline: allHistory.length,
    notes: allNotes.length,
    documents: allFiles.length,
  }

  return (
    <Box>
      <Nav active="tasks" />
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 500 }} noWrap>
              {file.borrower.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <StageBadge stage={file.stage} />
              <FileMenu
                fileId={file.id}
                currentStage={file.stage}
                actorId={actorId}
              />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <AssignSelector
              fileId={file.id}
              current={file.specialist}
              specialists={specialists}
              actorId={actorId}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2,
            mb: 4,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <User size={16} />
                <Typography variant="overline" color="text.secondary">
                  Borrower
                </Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1 }}>
                {file.borrower.name}
              </Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone size={14} />
                  <Typography variant="body2" color="text.secondary">
                    {file.borrower.phone || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Mail size={14} />
                  <Typography variant="body2" color="text.secondary">
                    {file.borrower.email || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MapPin size={14} />
                  <Typography variant="body2" color="text.secondary">
                    Property address unavailable
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Link
                  href={`https://force-energy-1679.lightning.force.com/lightning/r/Lead/${file.id}/view`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "primary.main",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {file.borrower.loanNumber
                      ? `Loan #${file.borrower.loanNumber}`
                      : "View in Salesforce"}
                  </Typography>
                </Link>
                {file.borrower.loanType && (
                  <Chip
                    label={file.borrower.loanType}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "primary.main",
                      color: "primary.main",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <LenderCard
                lender={file.lender}
                contacts={[]}
                saleDate={file.saleDate}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <AddTaskDialog
            fileId={file.id}
            specialists={specialists}
            actorId={actorId}
            assignedSpecialist={file.specialist}
          />
        </Box>
        <FileTabs counts={taskCounts}>
          <Card variant="outlined">
            <CardContent>
              {generatedTasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}
                >
                  <GeneratedTaskCheckbox task={task} actorId={actorId} />
                  <Typography
                    sx={{
                      flex: 1,
                      textDecoration:
                        task.status === "Completed" ? "line-through" : "none",
                      color:
                        task.type === "internal_red_flag" &&
                        task.status === "Open"
                          ? "error.main"
                          : "inherit",
                      fontWeight:
                        task.type === "internal_red_flag" &&
                        task.status === "Open"
                          ? 600
                          : 400,
                    }}
                  >
                    {task.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                  </Typography>
                </Box>
              ))}
              {generatedTasks.length === 0 && (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No tasks yet.
                </Typography>
              )}
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              {historyLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : allHistory.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {allHistory.map((entry, index) => (
                    <HistoryItem
                      key={entry.Id}
                      entry={entry}
                      isLast={index === allHistory.length - 1}
                    />
                  ))}
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No timeline events yet.
                </Typography>
              )}
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              {notesLoading ? (
                <TabLoading />
              ) : allNotes.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {allNotes.map((note, index) => (
                    <Box
                      key={note.id}
                      sx={{
                        py: 1.5,
                        borderBottom: index === allNotes.length - 1 ? 0 : 1,
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {note.authorName ?? "Unknown poster"}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flexShrink: 0 }}
                        >
                          {formatDate(note.updatedAt || note.createdAt)}
                        </Typography>
                      </Box>
                      {note.body ? (
                        <Box
                          component="div"
                          color="text.secondary"
                          sx={{
                            mt: 0.75,
                            typography: "body2",
                            "& p": { m: 0 },
                            "& p + p": { mt: 1 },
                            "& a": { color: "primary.main" },
                            "& ul, & ol": { pl: 2.5, my: 0.5 },
                          }}
                          dangerouslySetInnerHTML={{ __html: note.body }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.75 }}
                        >
                          No note content.
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No notes yet.
                </Typography>
              )}
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              {filesLoading ? (
                <TabLoading />
              ) : allFiles.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {allFiles.map((document, index) => (
                    <Box
                      key={`${document.source}-${document.id}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 1,
                        borderBottom: index === allFiles.length - 1 ? 0 : 1,
                        borderColor: "divider",
                      }}
                    >
                      <FileText size={18} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontWeight: 500 }}
                        >
                          {document.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {document.extension
                            ? document.extension.toUpperCase()
                            : (document.fileType ??
                              document.contentType ??
                              "File")}
                          {document.fileSize !== null
                            ? ` · ${formatFileSize(document.fileSize)}`
                            : ""}
                        </Typography>
                        {document.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: "block" }}
                          >
                            {document.description}
                          </Typography>
                        )}
                      </Box>
                      <Button
                        component="a"
                        href={document.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        size="small"
                        variant="outlined"
                        endIcon={<ExternalLink size={14} />}
                      >
                        Open
                      </Button>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  No documents uploaded.
                </Typography>
              )}
            </CardContent>
          </Card>
        </FileTabs>

        <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={12} />
            <Typography variant="caption" color="text.secondary">
              Created {formatDate(file.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={12} />
            <Typography variant="caption" color="text.secondary">
              Assigned{" "}
              {formatDate(leadMetadata?.processingStartDate ?? file.assignedAt)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Clock size={12} />
            <Typography variant="caption" color="text.secondary">
              Updated {formatRelative(file.updatedAt)}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

function TabLoading() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <CircularProgress size={24} />
    </Box>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function HistoryItem({
  entry,
  isLast,
}: {
  entry: SalesforceLeadHistory
  isLast: boolean
}) {
  const oldValue = entry.OldValue || ""
  const newValue = entry.NewValue || ""
  const formattedOldValue = formatHistoryValue(oldValue)
  const formattedNewValue = formatHistoryValue(newValue)
  const description =
    formattedOldValue && formattedNewValue
      ? `${formattedOldValue} → ${formattedNewValue}`
      : formattedOldValue
        ? ""
        : formattedNewValue
  const title =
    !oldValue && newValue
      ? `${capitalize(entry.Field.replace(/__c$/, ""))} Assigned`
      : capitalize(entry.Field.replace(/__c$/, ""))

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        py: 1,
        borderBottom: isLast ? 0 : 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.25 }}
          >
            {description}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.25 }}
        >
          {formatDate(entry.CreatedDate)}
        </Typography>
      </Box>
    </Box>
  )
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function formatHistoryValue(value = ""): string {
  if (value?.toString()?.startsWith("005Pm")) {
    return ALL_USERS.find((user) => user.Id === value)?.Name ?? value
  }

  return value.toString()
}
