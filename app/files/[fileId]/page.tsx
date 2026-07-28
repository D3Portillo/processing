import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Box, Typography, Card, CardContent, Tabs, Tab, Chip, Avatar, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from "@mui/material";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, Building, Clock } from "lucide-react";
import { getRepository } from "@/app/lib/repo-instance";
import { StageBadge } from "@/app/components/StageBadge";
import { StageSelector } from "@/app/components/StageSelector";
import { TimelineItem } from "@/app/components/TimelineItem";
import { AddTaskDialog } from "@/app/components/AddTaskDialog";
import { AddNoteForm } from "@/app/components/AddNoteForm";
import { CompleteTaskButton } from "@/app/components/CompleteTaskButton";
import { formatDate, formatDateTime, formatRelative, getInitials, isOverdue } from "@/app/lib/utils";
import { seedDatabaseAction } from "@/app/lib/actions";
import type { DocumentRecord } from "@/app/lib/types";

export const dynamic = "force-dynamic";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function FileDetailPage({ params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const repo = getRepository();

  let file;
  try { file = await repo.getFileById(fileId); }
  catch { await seedDatabaseAction(); file = await repo.getFileById(fileId); }
  if (!file) notFound();

  const specialists = await repo.getAllSpecialists();
  const actorId = file.specialist.id;
  const openTasks = file.tasks.filter((t) => t.status === "Open");
  const completedTasks = file.tasks.filter((t) => t.status === "Completed");

  return (
    <Box>
      {/* Header */}
      <Box component="header" sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", position: "sticky", top: 0, zIndex: 40 }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1, color: "text.secondary" }}>
              <ArrowLeft size={16} />
              <Typography variant="body2">Back</Typography>
            </Box>
          </Link>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} noWrap>{file.borrower.name}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{file.borrower.propertyAddress}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexShrink: 0 }}>
              <StageBadge stage={file.stage} />
              <StageSelector fileId={file.id} currentStage={file.stage} actorId={actorId} />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Info cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 4 }}>
          {/* Borrower */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Borrower</Typography>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>{file.borrower.name}</Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Phone size={14} /><Typography variant="body2" color="text.secondary">{file.borrower.phone}</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Mail size={14} /><Typography variant="body2" color="text.secondary">{file.borrower.email}</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><MapPin size={14} /><Typography variant="body2" color="text.secondary">{file.borrower.propertyAddress}</Typography></Box>
              </Stack>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" color="text.secondary">Loan #{file.borrower.loanNumber}</Typography>
            </CardContent>
          </Card>

          {/* Team + Sale Date */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary">Assigned Team</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, fontSize: "0.8rem", bgcolor: file.specialist.avatarColor }}>{getInitials(file.specialist.name)}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{file.specialist.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Specialist</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Building size={16} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>{file.lender.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{file.lender.phone}</Typography>
                </Box>
              </Box>
              {file.saleDate && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Calendar size={16} color={isOverdue(file.saleDate) ? "error" : "disabled"} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Sale Date</Typography>
                      <Typography variant="body2" fontWeight={600} color={isOverdue(file.saleDate) ? "error" : "text.primary"}>
                        {formatDate(file.saleDate)} ({formatRelative(file.saleDate)})
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Tabs + Add Task */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Tabs value={0}>
            <Tab label={`Tasks (${openTasks.length})`} />
            <Tab label="Timeline" />
            <Tab label={`Notes (${file.notes.length})`} />
            <Tab label={`Documents (${file.documents.length})`} />
          </Tabs>
          <AddTaskDialog fileId={file.id} specialists={specialists} actorId={actorId} />
        </Box>

        {/* Tasks */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            {openTasks.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Open Tasks</Typography>
                <Stack spacing={0.5}>
                  {openTasks.map((task) => (
                    <Box key={task.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.5, borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
                      <CompleteTaskButton task={task} actorId={actorId} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500}>{task.title}</Typography>
                        <Box sx={{ display: "flex", gap: 1.5, mt: 0.75, alignItems: "center" }}>
                          <Chip label={task.priority} size="small" color={task.priority === "High" ? "error" : task.priority === "Medium" ? "warning" : "default"} variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                          {task.dueDate && (
                            <Typography variant="caption" color={isOverdue(task.dueDate) ? "error" : "text.secondary"} fontWeight={isOverdue(task.dueDate) ? 600 : 400}>
                              {isOverdue(task.dueDate) ? `Overdue · ${formatRelative(task.dueDate)}` : formatRelative(task.dueDate)}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">{task.assignedTo.name}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {completedTasks.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Completed ({completedTasks.length})</Typography>
                <Stack spacing={0.5}>
                  {completedTasks.map((task) => (
                    <Box key={task.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.5, borderRadius: 1 }}>
                      <CompleteTaskButton task={task} actorId={actorId} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ textDecoration: "line-through", color: "text.secondary" }}>{task.title}</Typography>
                        {task.completedAt && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>Completed {formatRelative(task.completedAt)}</Typography>}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
            {file.tasks.length === 0 && <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No tasks yet. Create one to get started.</Typography>}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card variant="outlined" sx={{ mb: 2, display: "none" }}>
          <CardContent>
            {file.timeline.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No timeline events</Typography> :
              <Box>{file.timeline.map((event) => <TimelineItem key={event.id} event={event} />)}</Box>}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card variant="outlined" sx={{ mb: 2, display: "none" }}>
          <CardContent>
            <Stack spacing={2}>
              <AddNoteForm fileId={file.id} authorId={actorId} />
              <Divider />
              {file.notes.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No notes yet</Typography> :
                <Stack spacing={2}>
                  {file.notes.map((note) => (
                    <Box key={note.id}>
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: note.author.avatarColor }}>{getInitials(note.author.name)}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{note.author.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{formatDateTime(note.createdAt)}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mt: 0.5 }}>{note.body}</Typography>
                    </Box>
                  ))}
                </Stack>}
            </Stack>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card variant="outlined" sx={{ mb: 2, display: "none" }}>
          <CardContent>
            {file.documents.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No documents uploaded</Typography> :
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Size</TableCell><TableCell>Uploaded By</TableCell><TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {file.documents.map((doc: DocumentRecord) => (
                    <TableRow key={doc.id}>
                      <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><FileText size={16} />{doc.name}</Box></TableCell>
                      <TableCell>{doc.type}</TableCell><TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell>{doc.uploadedBy.name}</TableCell><TableCell>{formatDate(doc.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>}
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Clock size={12} /><Typography variant="caption" color="text.secondary">Created {formatDate(file.createdAt)}</Typography></Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Clock size={12} /><Typography variant="caption" color="text.secondary">Updated {formatRelative(file.updatedAt)}</Typography></Box>
        </Box>
      </Container>
    </Box>
  );
}