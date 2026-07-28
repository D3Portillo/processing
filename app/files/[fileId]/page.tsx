import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/app/lib/repo-instance";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  Grid,
  Column,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListBody,
  StructuredListRow,
  StructuredListCell,
} from "@carbon/react";
import {
  ArrowLeft,
  Phone,
  Email,
  Location,
  Calendar,
  Document as DocumentIcon,
  Building,
  Time,
} from "@carbon/icons-react";
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
  try {
    file = await repo.getFileById(fileId);
  } catch {
    await seedDatabaseAction();
    file = await repo.getFileById(fileId);
  }

  if (!file) notFound();

  const specialists = await repo.getAllSpecialists();
  const actorId = file.specialist.id;

  const openTasks = file.tasks.filter((t) => t.status === "Open");
  const completedTasks = file.tasks.filter((t) => t.status === "Completed");

  return (
    <div className="min-h-screen">
      {/* Custom header (not Nav — needs back button + file info) */}
      <header className="cds--header border-b sticky top-0 z-40" style={{ background: "var(--cds--layer-01)" }}>
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href="/" className="text-sm text-[var(--cds--text-secondary)] hover:text-[var(--cds--text-primary)] flex items-center gap-1 mb-2">
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{file.borrower.name}</h1>
              <p className="text-sm text-[var(--cds--text-secondary)] truncate">{file.borrower.propertyAddress}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StageBadge stage={file.stage} />
              <StageSelector fileId={file.id} currentStage={file.stage} actorId={actorId} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6" style={{ marginTop: "3rem" }}>
        {/* Info grid */}
        <Grid>
          <Column sm={4} md={4} lg={8}>
            <div className="cds--tile p-4">
              <h3 className="text-sm font-medium text-[var(--cds--text-secondary)] mb-3">Borrower</h3>
              <p className="font-medium">{file.borrower.name}</p>
              <div className="flex items-center gap-2 text-sm text-[var(--cds--text-secondary)] mt-2">
                <Phone size={14} /> {file.borrower.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--cds--text-secondary)] mt-1">
                <Email size={14} /> {file.borrower.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--cds--text-secondary)] mt-1">
                <Location size={14} /> {file.borrower.propertyAddress}
              </div>
              <p className="text-xs text-[var(--cds--text-secondary)] mt-3">Loan #{file.borrower.loanNumber}</p>
            </div>
          </Column>
          <Column sm={4} md={4} lg={8}>
            <div className="cds--tile p-4">
              <h3 className="text-sm font-medium text-[var(--cds--text-secondary)] mb-3">Assigned Team</h3>
              <div className="flex items-center gap-3">
                <span className="cds--avatar size-8 text-sm font-semibold flex items-center justify-center rounded-full"
                  style={{ backgroundColor: file.specialist.avatarColor, color: "white" }}>
                  {getInitials(file.specialist.name)}
                </span>
                <div>
                  <p className="text-sm font-medium">{file.specialist.name}</p>
                  <p className="text-xs text-[var(--cds--text-secondary)]">Specialist</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--cds--border-subtle)]">
                <div className="flex items-center gap-2">
                  <Building size={16} className="text-[var(--cds--text-secondary)]" />
                  <div>
                    <p className="text-sm font-medium">{file.lender.name}</p>
                    <p className="text-xs text-[var(--cds--text-secondary)]">{file.lender.phone}</p>
                  </div>
                </div>
              </div>
              {file.saleDate && (
                <div className="mt-3 pt-3 border-t border-[var(--cds--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className={isOverdue(file.saleDate) ? "text-[var(--cds--text-error)]" : "text-[var(--cds--text-secondary)]"} />
                    <div>
                      <p className="text-xs text-[var(--cds--text-secondary)]">Sale Date</p>
                      <p className={`text-sm font-medium ${isOverdue(file.saleDate) ? "text-[var(--cds--text-error)]" : ""}`}>
                        {formatDate(file.saleDate)} ({formatRelative(file.saleDate)})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Column>
        </Grid>

        {/* Tabs + Add Task */}
        <div className="flex items-center justify-between">
          <Tabs>
            <TabList aria-label="File sections">
              <Tab>Tasks ({openTasks.length})</Tab>
              <Tab>Timeline</Tab>
              <Tab>Notes ({file.notes.length})</Tab>
              <Tab>Documents ({file.documents.length})</Tab>
            </TabList>
            <TabPanels>
              {/* Tasks */}
              <TabPanel>
                <div className="space-y-4 pt-4">
                  {openTasks.length > 0 && (
                    <div className="cds--tile p-4">
                      <h3 className="text-sm font-medium mb-3">Open Tasks</h3>
                      <div className="space-y-1">
                        {openTasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-[var(--cds--layer-hover)] transition-colors">
                            <CompleteTaskButton task={task} actorId={actorId} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{task.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <Tag type={task.priority === "High" ? "red" : task.priority === "Medium" ? "yellow" : "gray"} size="sm">{task.priority}</Tag>
                                {task.dueDate && (
                                  <span className={`text-xs ${isOverdue(task.dueDate) ? "text-[var(--cds--text-error)] font-semibold" : "text-[var(--cds--text-secondary)]"}`}>
                                    {isOverdue(task.dueDate) ? "Overdue · " : ""}{formatRelative(task.dueDate)}
                                  </span>
                                )}
                                <span className="text-xs text-[var(--cds--text-secondary)]">{task.assignedTo.name}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {completedTasks.length > 0 && (
                    <div className="cds--tile p-4">
                      <h3 className="text-sm font-medium text-[var(--cds--text-secondary)] mb-3">Completed ({completedTasks.length})</h3>
                      <div className="space-y-1">
                        {completedTasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-3 p-3 rounded-md">
                            <CompleteTaskButton task={task} actorId={actorId} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-through text-[var(--cds--text-secondary)]">{task.title}</p>
                              {task.completedAt && (
                                <p className="text-xs text-[var(--cds--text-secondary)] mt-0.5">Completed {formatRelative(task.completedAt)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {file.tasks.length === 0 && (
                    <div className="cds--tile py-12 text-center">
                      <p className="text-sm text-[var(--cds--text-secondary)]">No tasks yet. Create one to get started.</p>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* Timeline */}
              <TabPanel>
                <div className="cds--tile p-6 pt-4">
                  {file.timeline.length === 0 ? (
                    <p className="text-sm text-[var(--cds--text-secondary)] text-center py-8">No timeline events</p>
                  ) : (
                    <div className="space-y-0">
                      {file.timeline.map((event) => (
                        <TimelineItem key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* Notes */}
              <TabPanel>
                <div className="cds--tile p-6 pt-4 space-y-4">
                  <AddNoteForm fileId={file.id} authorId={actorId} />
                  <div className="border-t border-[var(--cds--border-subtle)] pt-4" />
                  {file.notes.length === 0 ? (
                    <p className="text-sm text-[var(--cds--text-secondary)] text-center py-8">No notes yet</p>
                  ) : (
                    <div className="space-y-4">
                      {file.notes.map((note) => (
                        <div key={note.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="cds--avatar size-6 text-[10px] flex items-center justify-center rounded-full"
                              style={{ backgroundColor: note.author.avatarColor, color: "white" }}>
                              {getInitials(note.author.name)}
                            </span>
                            <span className="text-sm font-medium">{note.author.name}</span>
                            <span className="text-xs text-[var(--cds--text-secondary)]">{formatDateTime(note.createdAt)}</span>
                          </div>
                          <p className="text-sm text-[var(--cds--text-secondary)] pl-8">{note.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* Documents */}
              <TabPanel>
                <div className="cds--tile p-6 pt-4">
                  {file.documents.length === 0 ? (
                    <p className="text-sm text-[var(--cds--text-secondary)] text-center py-8">No documents uploaded</p>
                  ) : (
                    <StructuredListWrapper>
                      <StructuredListHead>
                        <StructuredListRow head>
                          <StructuredListCell head>Name</StructuredListCell>
                          <StructuredListCell head>Type</StructuredListCell>
                          <StructuredListCell head>Size</StructuredListCell>
                          <StructuredListCell head>Uploaded By</StructuredListCell>
                          <StructuredListCell head>Date</StructuredListCell>
                        </StructuredListRow>
                      </StructuredListHead>
                      <StructuredListBody>
                        {file.documents.map((doc: DocumentRecord) => (
                          <StructuredListRow key={doc.id}>
                            <StructuredListCell>
                              <span className="flex items-center gap-2">
                                <DocumentIcon size={16} className="text-[var(--cds--text-secondary)]" />
                                {doc.name}
                              </span>
                            </StructuredListCell>
                            <StructuredListCell>{doc.type}</StructuredListCell>
                            <StructuredListCell>{formatFileSize(doc.fileSize)}</StructuredListCell>
                            <StructuredListCell>{doc.uploadedBy.name}</StructuredListCell>
                            <StructuredListCell>{formatDate(doc.createdAt)}</StructuredListCell>
                          </StructuredListRow>
                        ))}
                      </StructuredListBody>
                    </StructuredListWrapper>
                  )}
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>

          <div className="shrink-0">
            <AddTaskDialog fileId={file.id} specialists={specialists} actorId={actorId} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 text-xs text-[var(--cds--text-secondary)] pt-4">
          <span className="flex items-center gap-1">
            <Time size={12} /> Created {formatDate(file.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Time size={12} /> Updated {formatRelative(file.updatedAt)}
          </span>
        </div>
      </main>
    </div>
  );
}