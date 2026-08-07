// Shared types for tasks and lead metadata. Kept free of any DB client
// dependency so they can be imported from client components safely.

export const TASK_TYPES = [
  "welcome_email",
  "welcome_call",
  "follow_up_lender",
  "follow_up_borrower",
  "internal_red_flag",
  "custom",
] as const

export type TaskType = (typeof TASK_TYPES)[number]

export interface TaskRow {
  id: string
  file_id: string
  title: string
  type: TaskType
  assigned_to: string
  due_date: string | null
  status: "Open" | "Completed"
  note: string | null
  idempotency_key: string
  created_at: string
  completed_at: string | null
}

export interface TaskUpdateRow {
  id: string
  task_id: string
  file_id: string
  author_id: string
  body: string
  created_at: string
}
