import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/app/lib/repo-instance";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Avatar } from "@/app/components/ui/avatar";
import { Separator } from "@/app/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { StageBadge } from "@/app/components/StageBadge";
import { StageSelector } from "@/app/components/StageSelector";
import { TimelineItem } from "@/app/components/TimelineItem";
import { AddTaskDialog } from "@/app/components/AddTaskDialog";
import { AddNoteForm } from "@/app/components/AddNoteForm";
import { CompleteTaskButton } from "@/app/components/CompleteTaskButton";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, Building2, Clock } from "lucide-react";
import { Nav } from "@/app/components/Nav";
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
  // Use the file's specialist as the actor for actions
  const actorId = file.specialist.id;

  const openTasks = file.tasks.filter((t) => t.status === "Open");
  const completedTasks = file.tasks.filter((t) => t.status === "Completed");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{file.borrower.name}</h1>
              <p className="text-sm text-muted-foreground truncate">{file.borrower.propertyAddress}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StageBadge stage={file.stage} />
              <StageSelector fileId={file.id} currentStage={file.stage} actorId={actorId} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* Info grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Borrower card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Borrower</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">{file.borrower.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-3.5" /> {file.borrower.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-3.5" /> {file.borrower.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-3.5" /> {file.borrower.propertyAddress}
              </div>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">Loan #{file.borrower.loanNumber}</p>
            </CardContent>
          </Card>

          {/* Specialist + Lender card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Assigned Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar style={{ backgroundColor: file.specialist.avatarColor, color: "white" }}>
                  {getInitials(file.specialist.name)}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{file.specialist.name}</p>
                  <p className="text-xs text-muted-foreground">Specialist</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.lender.name}</p>
                  <p className="text-xs text-muted-foreground">{file.lender.phone}</p>
                </div>
              </div>
              {file.saleDate && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Calendar className={`size-4 ${isOverdue(file.saleDate) ? "text-destructive" : "text-muted-foreground"}`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Sale Date</p>
                      <p className={`text-sm font-medium ${isOverdue(file.saleDate) ? "text-destructive" : ""}`}>
                        {formatDate(file.saleDate)} ({formatRelative(file.saleDate)})
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="tasks">Tasks ({openTasks.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes ({file.notes.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({file.documents.length})</TabsTrigger>
            </TabsList>
            <AddTaskDialog fileId={file.id} specialists={specialists} actorId={actorId} />
          </div>

          {/* Tasks tab */}
          <TabsContent value="tasks" className="space-y-4">
            {openTasks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Open Tasks</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  {openTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                      <CompleteTaskButton task={task} actorId={actorId} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs font-medium ${task.priority === "High" ? "text-destructive" : task.priority === "Medium" ? "text-warning" : "text-muted-foreground"}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className={`text-xs ${isOverdue(task.dueDate) ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                              {isOverdue(task.dueDate) ? "Overdue · " : ""}{formatRelative(task.dueDate)}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {completedTasks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Completed ({completedTasks.length})</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-1">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-md">
                      <CompleteTaskButton task={task} actorId={actorId} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-through text-muted-foreground">{task.title}</p>
                        {task.completedAt && (
                          <p className="text-xs text-muted-foreground mt-0.5">Completed {formatRelative(task.completedAt)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {file.tasks.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-sm text-muted-foreground">No tasks yet. Create one to get started.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline tab */}
          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-6">
                {file.timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No timeline events</p>
                ) : (
                  <div className="space-y-0">
                    {file.timeline.map((event) => (
                      <TimelineItem key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <AddNoteForm fileId={file.id} authorId={actorId} />
                <Separator />
                {file.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No notes yet</p>
                ) : (
                  <div className="space-y-4">
                    {file.notes.map((note) => (
                      <div key={note.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6 text-[10px]" style={{ backgroundColor: note.author.avatarColor, color: "white" }}>
                            {getInitials(note.author.name)}
                          </Avatar>
                          <span className="text-sm font-medium">{note.author.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(note.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground pl-8">{note.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents tab */}
          <TabsContent value="documents">
            <Card>
              <CardContent className="p-6">
                {file.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {file.documents.map((doc: DocumentRecord) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-md border">
                        <div className="p-2 rounded-md bg-muted">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type} · {formatFileSize(doc.fileSize)} · {doc.uploadedBy.name} · {formatDate(doc.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer: file metadata */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4">
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> Created {formatDate(file.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> Updated {formatRelative(file.updatedAt)}
          </span>
        </div>
      </main>
    </div>
  );
}