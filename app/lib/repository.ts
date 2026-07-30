import type {
  MortgageFile,
  MortgageFileDetail,
  Task,
  Note,
  TimelineEvent,
  DocumentRecord,
  DashboardData,
  Specialist,
  Lender,
  LenderPOC,
  Stage,
  TaskPriority,
} from "./types";

// ─── Repository Interface ────────────────────────────────────
// The UI talks to this interface. Today it's backed by Turso (libsql).
// Tomorrow it could be backed by Salesforce — the UI won't change.

export interface MortgageFileRepository {
  // Dashboard
  getDashboardData(specialistId?: string): Promise<DashboardData>;

  // File CRUD
  getAllFiles(): Promise<MortgageFile[]>;
  getFileById(id: string): Promise<MortgageFileDetail | null>;
  updateFileStage(fileId: string, stage: Stage, actorId: string): Promise<void>;

  // Tasks
  createTask(input: {
    fileId: string;
    title: string;
    description?: string;
    assignedToId: string;
    dueDate?: string;
    priority: TaskPriority;
    actorId: string;
  }): Promise<Task>;
  completeTask(taskId: string, actorId: string): Promise<void>;

  // Notes
  addNote(input: {
    fileId: string;
    authorId: string;
    body: string;
  }): Promise<Note>;

  // Specialists
  getAllSpecialists(): Promise<Specialist[]>;

  // Lenders
  getAllLenders(): Promise<Lender[]>;

  // Lender POCs
  getAllPocs(): Promise<LenderPOC[]>;
}