import { drizzle } from "drizzle-orm/libsql";
import { eq, and, lte, gte, isNull, desc, asc, or, sql, ne } from "drizzle-orm";
import { getDb } from "./db";
import * as schema from "./schema";
import type { MortgageFileRepository } from "./repository";
import type {
  MortgageFile,
  MortgageFileDetail,
  Task,
  Note,
  TimelineEvent,
  DocumentRecord,
  DashboardData,
  Specialist,
  Stage,
  TaskPriority,
} from "./types";

// ─── Turso (libsql) Repository ───────────────────────────────
// Maps DB rows → domain types. Implements the repository interface
// using Drizzle ORM over Turso/libsql.

function toISO(date: Date): string {
  return date.toISOString();
}

function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function endOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(23, 59, 59, 999);
  return r;
}

export class TursoRepository implements MortgageFileRepository {
  private db = drizzle(getDb(), { schema });

  // ── Helpers: map DB rows → domain types ──────────────────

  private mapSpecialist(row: typeof schema.specialists.$inferSelect): Specialist {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatarColor: row.avatarColor,
    };
  }

  private mapFile(
    file: typeof schema.mortgageFiles.$inferSelect,
    borrower: typeof schema.borrowers.$inferSelect,
    specialist: typeof schema.specialists.$inferSelect,
    lender: typeof schema.lenders.$inferSelect
  ): MortgageFile {
    return {
      id: file.id,
      borrower: {
        id: borrower.id,
        name: borrower.name,
        phone: borrower.phone,
        email: borrower.email,
        propertyAddress: borrower.propertyAddress,
        loanNumber: borrower.loanNumber,
      },
      specialist: this.mapSpecialist(specialist),
      lender: {
        id: lender.id,
        name: lender.name,
        phone: lender.phone,
        email: lender.email,
      },
      stage: file.stage as MortgageFile["stage"],
      saleDate: file.saleDate,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    };
  }

  private mapTask(
    row: typeof schema.tasks.$inferSelect,
    specialist: typeof schema.specialists.$inferSelect
  ): Task {
    return {
      id: row.id,
      fileId: row.fileId,
      title: row.title,
      description: row.description,
      assignedTo: this.mapSpecialist(specialist),
      dueDate: row.dueDate,
      priority: row.priority as TaskPriority,
      status: row.status as Task["status"],
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    };
  }

  private mapNote(
    row: typeof schema.notes.$inferSelect,
    specialist: typeof schema.specialists.$inferSelect
  ): Note {
    return {
      id: row.id,
      fileId: row.fileId,
      author: this.mapSpecialist(specialist),
      body: row.body,
      createdAt: row.createdAt,
    };
  }

  private mapTimelineEvent(
    row: typeof schema.timelineEvents.$inferSelect,
    specialist: typeof schema.specialists.$inferSelect
  ): TimelineEvent {
    return {
      id: row.id,
      fileId: row.fileId,
      type: row.type as TimelineEvent["type"],
      actor: this.mapSpecialist(specialist),
      description: row.description,
      metadata: row.metadata ? JSON.parse(row.metadata) : null,
      createdAt: row.createdAt,
    };
  }

  private mapDocument(
    row: typeof schema.documents.$inferSelect,
    specialist: typeof schema.specialists.$inferSelect
  ): DocumentRecord {
    return {
      id: row.id,
      fileId: row.fileId,
      name: row.name,
      type: row.type,
      uploadedBy: this.mapSpecialist(specialist),
      fileSize: row.fileSize,
      createdAt: row.createdAt,
    };
  }

  // ── Dashboard ────────────────────────────────────────────

  async getDashboardData(): Promise<DashboardData> {
    const now = new Date();
    const todayStart = toISO(startOfDay(now));
    const todayEnd = toISO(endOfDay(now));
    const tomorrowStart = toISO(startOfDay(new Date(now.getTime() + 86400000)));
    const tomorrowEnd = toISO(endOfDay(new Date(now.getTime() + 86400000)));
    const nowISO = toISO(now);

    // Open tasks with due dates
    const allOpenTasksRows = await this.db
      .select({
        task: schema.tasks,
        specialist: schema.specialists,
        file: schema.mortgageFiles,
        borrower: schema.borrowers,
        lender: schema.lenders,
      })
      .from(schema.tasks)
      .innerJoin(schema.specialists, eq(schema.tasks.assignedToId, schema.specialists.id))
      .innerJoin(schema.mortgageFiles, eq(schema.tasks.fileId, schema.mortgageFiles.id))
      .innerJoin(schema.borrowers, eq(schema.mortgageFiles.borrowerId, schema.borrowers.id))
      .innerJoin(schema.lenders, eq(schema.mortgageFiles.lenderId, schema.lenders.id))
      .where(and(eq(schema.tasks.status, "Open"), isNull(schema.tasks.completedAt)));

    const allOpenTasks: Task[] = [];

    for (const row of allOpenTasksRows) {
      const t = this.mapTask(row.task, row.specialist);
      allOpenTasks.push({ ...t, fileId: row.task.fileId });
    }

    // Upcoming sale dates (next 30 days, not Completed/Rejected)
    const saleFiles = await this.db
      .select({
        file: schema.mortgageFiles,
        borrower: schema.borrowers,
        specialist: schema.specialists,
        lender: schema.lenders,
      })
      .from(schema.mortgageFiles)
      .innerJoin(schema.borrowers, eq(schema.mortgageFiles.borrowerId, schema.borrowers.id))
      .innerJoin(schema.specialists, eq(schema.mortgageFiles.specialistId, schema.specialists.id))
      .innerJoin(schema.lenders, eq(schema.mortgageFiles.lenderId, schema.lenders.id))
      .where(
        and(
          sql`${schema.mortgageFiles.saleDate} IS NOT NULL`,
          sql`${schema.mortgageFiles.saleDate} >= ${nowISO}`,
          sql`${schema.mortgageFiles.saleDate} <= ${toISO(new Date(now.getTime() + 30 * 86400000))}`,
          ne(schema.mortgageFiles.stage, "Completed"),
          ne(schema.mortgageFiles.stage, "Rejected")
        )
      )
      .orderBy(asc(schema.mortgageFiles.saleDate))
      .limit(10);

    const upcomingSaleDates = saleFiles.map((r) => this.mapFile(r.file, r.borrower, r.specialist, r.lender));

    // Recently updated files
    const recentFiles = await this.db
      .select({
        file: schema.mortgageFiles,
        borrower: schema.borrowers,
        specialist: schema.specialists,
        lender: schema.lenders,
      })
      .from(schema.mortgageFiles)
      .innerJoin(schema.borrowers, eq(schema.mortgageFiles.borrowerId, schema.borrowers.id))
      .innerJoin(schema.specialists, eq(schema.mortgageFiles.specialistId, schema.specialists.id))
      .innerJoin(schema.lenders, eq(schema.mortgageFiles.lenderId, schema.lenders.id))
      .orderBy(desc(schema.mortgageFiles.updatedAt))
      .limit(8);

    const recentlyUpdatedFiles = recentFiles.map((r) => this.mapFile(r.file, r.borrower, r.specialist, r.lender));

    return { allOpenTasks, upcomingSaleDates, recentlyUpdatedFiles };
  }

  // ── Files ────────────────────────────────────────────────

  async getAllFiles(): Promise<MortgageFile[]> {
    const rows = await this.db
      .select({
        file: schema.mortgageFiles,
        borrower: schema.borrowers,
        specialist: schema.specialists,
        lender: schema.lenders,
      })
      .from(schema.mortgageFiles)
      .innerJoin(schema.borrowers, eq(schema.mortgageFiles.borrowerId, schema.borrowers.id))
      .innerJoin(schema.specialists, eq(schema.mortgageFiles.specialistId, schema.specialists.id))
      .innerJoin(schema.lenders, eq(schema.mortgageFiles.lenderId, schema.lenders.id))
      .orderBy(desc(schema.mortgageFiles.updatedAt));

    return rows.map((r) => this.mapFile(r.file, r.borrower, r.specialist, r.lender));
  }

  async getFileById(id: string): Promise<MortgageFileDetail | null> {
    const fileRows = await this.db
      .select({
        file: schema.mortgageFiles,
        borrower: schema.borrowers,
        specialist: schema.specialists,
        lender: schema.lenders,
      })
      .from(schema.mortgageFiles)
      .innerJoin(schema.borrowers, eq(schema.mortgageFiles.borrowerId, schema.borrowers.id))
      .innerJoin(schema.specialists, eq(schema.mortgageFiles.specialistId, schema.specialists.id))
      .innerJoin(schema.lenders, eq(schema.mortgageFiles.lenderId, schema.lenders.id))
      .where(eq(schema.mortgageFiles.id, id))
      .limit(1);

    if (fileRows.length === 0) return null;
    const f = fileRows[0];
    const file = this.mapFile(f.file, f.borrower, f.specialist, f.lender);

    const [taskRows, noteRows, timelineRows, docRows] = await Promise.all([
      this.db
        .select({ task: schema.tasks, specialist: schema.specialists })
        .from(schema.tasks)
        .innerJoin(schema.specialists, eq(schema.tasks.assignedToId, schema.specialists.id))
        .where(eq(schema.tasks.fileId, id))
        .orderBy(desc(schema.tasks.createdAt)),
      this.db
        .select({ note: schema.notes, specialist: schema.specialists })
        .from(schema.notes)
        .innerJoin(schema.specialists, eq(schema.notes.authorId, schema.specialists.id))
        .where(eq(schema.notes.fileId, id))
        .orderBy(desc(schema.notes.createdAt)),
      this.db
        .select({ event: schema.timelineEvents, specialist: schema.specialists })
        .from(schema.timelineEvents)
        .innerJoin(schema.specialists, eq(schema.timelineEvents.actorId, schema.specialists.id))
        .where(eq(schema.timelineEvents.fileId, id))
        .orderBy(desc(schema.timelineEvents.createdAt)),
      this.db
        .select({ doc: schema.documents, specialist: schema.specialists })
        .from(schema.documents)
        .innerJoin(schema.specialists, eq(schema.documents.uploadedById, schema.specialists.id))
        .where(eq(schema.documents.fileId, id))
        .orderBy(desc(schema.documents.createdAt)),
    ]);

    return {
      ...file,
      tasks: taskRows.map((r) => this.mapTask(r.task, r.specialist)),
      notes: noteRows.map((r) => this.mapNote(r.note, r.specialist)),
      timeline: timelineRows.map((r) => this.mapTimelineEvent(r.event, r.specialist)),
      documents: docRows.map((r) => this.mapDocument(r.doc, r.specialist)),
    };
  }

  async updateFileStage(fileId: string, stage: Stage, actorId: string): Promise<void> {
    const now = toISO(new Date());
    await this.db
      .update(schema.mortgageFiles)
      .set({ stage, updatedAt: now })
      .where(eq(schema.mortgageFiles.id, fileId));

    await this.db.insert(schema.timelineEvents).values({
      id: crypto.randomUUID(),
      fileId,
      type: "stage_changed",
      actorId,
      description: `Stage changed to ${stage}`,
      metadata: JSON.stringify({ stage }),
      createdAt: now,
    });
  }

  // ── Tasks ────────────────────────────────────────────────

  async createTask(input: {
    fileId: string;
    title: string;
    description?: string;
    assignedToId: string;
    dueDate?: string;
    priority: TaskPriority;
    actorId: string;
  }): Promise<Task> {
    const now = toISO(new Date());
    const id = crypto.randomUUID();

    const specialistRow = await this.db
      .select()
      .from(schema.specialists)
      .where(eq(schema.specialists.id, input.assignedToId))
      .limit(1);

    if (specialistRow.length === 0) throw new Error("Specialist not found");

    await this.db.insert(schema.tasks).values({
      id,
      fileId: input.fileId,
      title: input.title,
      description: input.description ?? null,
      assignedToId: input.assignedToId,
      dueDate: input.dueDate ?? null,
      priority: input.priority,
      status: "Open",
      createdAt: now,
      completedAt: null,
    });

    await this.db.insert(schema.timelineEvents).values({
      id: crypto.randomUUID(),
      fileId: input.fileId,
      type: "task_created",
      actorId: input.actorId,
      description: `Task created: ${input.title}`,
      metadata: JSON.stringify({ taskId: id }),
      createdAt: now,
    });

    await this.db
      .update(schema.mortgageFiles)
      .set({ updatedAt: now })
      .where(eq(schema.mortgageFiles.id, input.fileId));

    return {
      id,
      fileId: input.fileId,
      title: input.title,
      description: input.description ?? null,
      assignedTo: this.mapSpecialist(specialistRow[0]),
      dueDate: input.dueDate ?? null,
      priority: input.priority,
      status: "Open",
      createdAt: now,
      completedAt: null,
    };
  }

  async completeTask(taskId: string, actorId: string): Promise<void> {
    const now = toISO(new Date());

    const taskRow = await this.db.select().from(schema.tasks).where(eq(schema.tasks.id, taskId)).limit(1);
    if (taskRow.length === 0) throw new Error("Task not found");

    await this.db
      .update(schema.tasks)
      .set({ status: "Completed", completedAt: now })
      .where(eq(schema.tasks.id, taskId));

    await this.db.insert(schema.timelineEvents).values({
      id: crypto.randomUUID(),
      fileId: taskRow[0].fileId,
      type: "task_completed",
      actorId,
      description: `Task completed: ${taskRow[0].title}`,
      metadata: JSON.stringify({ taskId }),
      createdAt: now,
    });

    await this.db
      .update(schema.mortgageFiles)
      .set({ updatedAt: now })
      .where(eq(schema.mortgageFiles.id, taskRow[0].fileId));
  }

  // ── Notes ────────────────────────────────────────────────

  async addNote(input: { fileId: string; authorId: string; body: string }): Promise<Note> {
    const now = toISO(new Date());
    const id = crypto.randomUUID();

    const specialistRow = await this.db
      .select()
      .from(schema.specialists)
      .where(eq(schema.specialists.id, input.authorId))
      .limit(1);

    if (specialistRow.length === 0) throw new Error("Specialist not found");

    await this.db.insert(schema.notes).values({
      id,
      fileId: input.fileId,
      authorId: input.authorId,
      body: input.body,
      createdAt: now,
    });

    await this.db.insert(schema.timelineEvents).values({
      id: crypto.randomUUID(),
      fileId: input.fileId,
      type: "note_added",
      actorId: input.authorId,
      description: "Note added",
      metadata: null,
      createdAt: now,
    });

    await this.db
      .update(schema.mortgageFiles)
      .set({ updatedAt: now })
      .where(eq(schema.mortgageFiles.id, input.fileId));

    return {
      id,
      fileId: input.fileId,
      author: this.mapSpecialist(specialistRow[0]),
      body: input.body,
      createdAt: now,
    };
  }

  // ── Specialists ──────────────────────────────────────────

  async getAllSpecialists(): Promise<Specialist[]> {
    const rows = await this.db.select().from(schema.specialists).orderBy(asc(schema.specialists.name));
    return rows.map(this.mapSpecialist);
  }
}