"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { Container, Box, Typography, Card, CardContent, Avatar, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Phone, Mail, MapPin, FileText, Clock, User } from "lucide-react";
import { getFileById, getAllSpecialists, getAllLenders, getAllLenderContacts, useStore } from "@/app/lib/mock-data";
import { Nav } from "@/app/components/Nav";
import { FileMenu } from "@/app/components/FileMenu";
import { AssignSelector } from "@/app/components/AssignSelector";
import { LenderCard } from "@/app/components/LenderCard";
import { StageBadge } from "@/app/components/StageBadge";
import { FileTabs } from "@/app/components/FileTabs";
import { TimelineItem } from "@/app/components/TimelineItem";
import { AddTaskDialog } from "@/app/components/AddTaskDialog";
import { AddNoteForm } from "@/app/components/AddNoteForm";
import { CompleteTaskButton } from "@/app/components/CompleteTaskButton";
import { formatDate, formatDateTime, formatRelative, getInitials, isOverdue } from "@/app/lib/utils";
import type { DocumentRecord } from "@/app/lib/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDetailPage() {
  useStore();
  const params = useParams();
  const fileId = params.fileId as string;
  const file = getFileById(fileId);
  if (!file) notFound();

  const specialists = getAllSpecialists();
  const allPocs = getAllLenderContacts();
  const actorId = file.specialist?.id ?? specialists[0]?.id ?? "";
  const openTasks = file.tasks.filter((t) => t.status === "Open");
  const completedTasks = file.tasks.filter((t) => t.status === "Completed");

  return (
    <Box>
      <Nav active="tasks" />

      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }} noWrap>{file.borrower.name}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexShrink: 0 }}>
              <StageBadge stage={file.stage} />
              <FileMenu fileId={file.id} currentStage={file.stage} actorId={actorId} />
            </Box>
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <AssignSelector fileId={file.id} current={file.specialist} specialists={specialists} actorId={actorId} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 4 }}>
          {/* Borrower */}
          <Card variant="outlined" sx={{ display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <User size={16} />
                <Typography variant="overline" color="text.secondary">Borrower</Typography>
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1 }}>{file.borrower.name}</Typography>
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Phone size={14} /><Typography variant="body2" color="text.secondary">{file.borrower.phone}</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Mail size={14} /><Typography variant="body2" color="text.secondary">{file.borrower.email}</Typography></Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><MapPin size={14} /><Typography variant="body2" color="text.secondary">{file.borrower.propertyAddress}</Typography></Box>
              </Stack>
              <Box sx={{ mt: "auto" }}>
                <Divider sx={{ mb: 1.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {/* TODO: replace with borrower ID once data is connected */}
                  <Link href="https://force-energy-1679.lightning.force.com/lightning/r/Lead/00QPm00001L8UZ1MAN/view" target="_blank" style={{ textDecoration: "none" }}>
                    <Typography variant="caption" sx={{ color: "primary.main", "&:hover": { textDecoration: "underline" } }}>Loan #{file.borrower.loanNumber}</Typography>
                  </Link>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ${file.borrower.monthlyPayment.toLocaleString()}<Box component="span" sx={{ fontWeight: 400, color: "text.secondary", fontSize: "0.75rem" }}>/mo</Box>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Lender */}
          <Card variant="outlined">
            <CardContent>
              <LenderCard lender={file.lender} contacts={allPocs.filter((p) => p.lenderId === file.lender.id)} saleDate={file.saleDate} />
            </CardContent>
          </Card>
        </Box>

        {/* Tabs + Add Task */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 1 }}>
          <AddTaskDialog fileId={file.id} specialists={specialists} actorId={actorId} />
        </Box>
        <FileTabs counts={{ tasks: openTasks.length, timeline: file.timeline.length, notes: file.notes.length, documents: file.documents.length }}>
          {[
            /* ── Tasks ── */
            (
              <Card variant="outlined" key="tasks">
                <CardContent>
                  {openTasks.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Open Tasks</Typography>
                      <Stack spacing={0.5}>
                        {openTasks.map((task) => (
                          <Box key={task.id} sx={{ display: "flex", alignItems: "flex-start", gap: 1, p: 1.5, borderRadius: 1, "&:hover": { bgcolor: "action.hover" } }}>
                            <CompleteTaskButton task={task} actorId={actorId} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.title}</Typography>
                              <Box sx={{ display: "flex", gap: 1.5, mt: 0.75, alignItems: "center" }}>
                                {task.dueDate && (
                                  <Typography variant="caption" color={isOverdue(task.dueDate) ? "error" : "text.secondary"} sx={{ fontWeight: isOverdue(task.dueDate) ? 600 : 400 }}>
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
                              <Typography variant="body2" sx={{ fontWeight: 500, textDecoration: "line-through", color: "text.secondary" }}>{task.title}</Typography>
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
            ),
            /* ── Timeline ── */
            (
              <Card variant="outlined" key="timeline">
                <CardContent>
                  {file.timeline.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No timeline events</Typography> :
                    <Box>{file.timeline.map((event) => <TimelineItem key={event.id} event={event} />)}</Box>}
                </CardContent>
              </Card>
            ),
            /* ── Notes ── */
            (
              <Card variant="outlined" key="notes">
                <CardContent>
                  <Stack spacing={2}>
                    <AddNoteForm fileId={file.id} authorId={actorId} />
                    {file.notes.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No notes yet</Typography> :
                      <Stack spacing={2}>
                        {file.notes.map((note) => (
                          <Box key={note.id}>
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: "0.6rem", bgcolor: note.author.avatarColor }}>{getInitials(note.author.name)}</Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>{note.author.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{formatDateTime(note.createdAt)}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ pl: 4, mt: 0.5 }}>{note.body}</Typography>
                          </Box>
                        ))}
                      </Stack>}
                  </Stack>
                </CardContent>
              </Card>
            ),
            /* ── Documents ── */
            (
              <Card variant="outlined" key="documents">
                <CardContent>
                  {file.documents.length === 0 ? <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>No documents uploaded</Typography> :
                    <Table size="small" sx={{ "& tr:last-child td": { borderBottom: "none !important" } }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell>Size</TableCell><TableCell>Uploaded By</TableCell><TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {file.documents.map((doc: DocumentRecord) => (
                          <TableRow key={doc.id} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                            <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><FileText size={16} />{doc.name}</Box></TableCell>
                            <TableCell>{doc.type}</TableCell><TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                            <TableCell>{doc.uploadedBy.name}</TableCell><TableCell>{formatDate(doc.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>}
                </CardContent>
              </Card>
            ),
          ]}
        </FileTabs>

        {/* Footer */}
        <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Clock size={12} /><Typography variant="caption" color="text.secondary">Created {formatDate(file.createdAt)}</Typography></Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}><Clock size={12} /><Typography variant="caption" color="text.secondary">Updated {formatRelative(file.updatedAt)}</Typography></Box>
        </Box>
      </Container>
    </Box>
  );
}