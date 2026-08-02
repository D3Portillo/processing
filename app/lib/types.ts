// Domain Model — Mortgage Operations Portal
// These types represent the business entities the UI works with.
// The repository layer maps between DB rows and these domain types.

export type Stage =
  | "Processing"
  | "TPA Pending"
  | "Sub Pending"
  | "Submitted"
  | "Underwriting"
  | "Missing Documents"
  | "Approved"
  | "Pending Approved"
  | "Denied"
  | "Escalation"
  | "Closed"

export const STAGES: Stage[] = [
  "Processing",
  "TPA Pending",
  "Sub Pending",
  "Submitted",
  "Underwriting",
  "Missing Documents",
  "Approved",
  "Pending Approved",
  "Denied",
  "Escalation",
  "Closed",
]

export type TaskStatus = "Open" | "Completed"

export type TimelineEventType =
  | "task_completed"
  | "task_created"
  | "note_added"
  | "stage_changed"
  | "file_assigned"
  | "document_uploaded"
  | "file_created"

export interface Specialist {
  id: string
  name: string
  email: string
  avatarColor: string
}

export interface Lender {
  id: string
  name: string
  phone: string
  email: string
}

export interface LenderContact {
  id: string
  department: string
  name: string | null // optional — if null, department is the contact
  phone: string
  email: string
  lenderId: string
}

export interface Borrower {
  id: string
  name: string
  phone: string
  email: string
  propertyAddress: string
  loanNumber: string
  monthlyPayment: number
  loanType?: string | null
}

export interface MortgageFile {
  id: string
  borrower: Borrower
  specialist: Specialist | null
  lender: Lender
  poc: LenderContact | null
  stage: Stage
  saleDate: string | null
  createdAt: string
  assignedAt: string
  updatedAt: string
  nextStatusUpdate?: string | null
  lastLenderCall?: string | null
}

export interface Task {
  id: string
  fileId: string
  title: string
  description: string | null
  assignedTo: Specialist
  dueDate: string | null // ISO date string
  status: TaskStatus
  createdAt: string
  completedAt: string | null
}

export interface Note {
  id: string
  fileId: string
  author: Specialist
  body: string
  createdAt: string
}

export interface TimelineEvent {
  id: string
  fileId: string
  type: TimelineEventType
  actor: Specialist
  description: string
  metadata: Record<string, string> | null
  createdAt: string
}

export interface DocumentRecord {
  id: string
  fileId: string
  name: string
  type: string
  uploadedBy: Specialist
  fileSize: number // bytes
  createdAt: string
}

// Composite — used by the File detail page
export interface MortgageFileDetail extends MortgageFile {
  tasks: Task[]
  notes: Note[]
  timeline: TimelineEvent[]
  documents: DocumentRecord[]
}

// Dashboard view models
export type TaskFilter =
  | "all"
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "no-due-date"

export interface DashboardData {
  allOpenTasks: Task[]
  upcomingSaleDates: MortgageFile[]
  recentlyUpdatedFiles: MortgageFile[]
}
