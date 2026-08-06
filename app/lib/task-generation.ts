import { randomUUID } from "node:crypto"
import type { SalesforceLead } from "./sf-leads"
import { db, type TaskType } from "./db"
import { addDays, daysBetween, todayInTz, toDateInTz } from "./dates"
import { getLeadMetadata, type LeadMetadata } from "./lead-metadata"

// Dead-end statuses — no Layer 1 or Layer 2 tasks are generated.
export const HALTED_STATUSES = new Set([
  "DENIED",
  "UNRSPSV",
  "Unqualified",
  "Non-Payment",
  "Closed",
  "Refunded",
  "APPROVED",
])

const UNDERWRITING_STATUS = "UNDERWRITING"

// The agent sees the follow-up task this many days before the anchor date.
const UPCOMING_WINDOW_DAYS = 2
const STALE_FOLLOW_UP_DAYS = 9
const WELCOME_TASK_AUTO_COMPLETE_DAYS = 9

// Cadence in days based on the lead's current status.
export function cadenceForStatus(status: string): number {
  return status === UNDERWRITING_STATUS ? 14 : 7
}

// Resolves the anchor date for a lead:
//   1. Next_Status_Update__c (primary, team-maintained)
//   2. Fallback: welcome call completion date + status cadence.
// Returns null when no anchor can be determined.
export function resolveAnchor(
  lead: SalesforceLead,
  metadata: Partial<LeadMetadata> | null,
): string | null {
  const next = toDateInTz(lead.Next_Status_Update__c, "UTC")
  if (next) return next

  const genesis = toDateInTz(metadata?.welcomeCallCompletedAt, "UTC")
  if (!genesis) return null
  return addDays(genesis, cadenceForStatus(lead.Status))
}

interface UpsertInput {
  fileId: string
  title: string
  type: TaskType
  assignedToId: string
  dueDate: string | null
  idempotencyKey: string
  status?: "Open" | "Completed"
  completedAt?: string | null
}

// Inserts a task keyed by a deterministic idempotency key. Returns true if a
// new row was created, false if it already existed (no-op on re-runs).
async function upsertTask(input: UpsertInput): Promise<boolean> {
  const result = await db.execute({
    sql: `INSERT INTO tasks
      (id, file_id, title, type, assigned_to, due_date, status, note, idempotency_key, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)
      ON CONFLICT(idempotency_key) DO NOTHING`,
    args: [
      randomUUID(),
      input.fileId,
      input.title,
      input.type,
      input.assignedToId,
      input.dueDate,
      input.status ?? "Open",
      input.idempotencyKey,
      new Date().toISOString(),
      input.completedAt ?? null,
    ],
  })
  return Number(result.rowsAffected) > 0
}

// Welcome Email / Welcome Call — one-time per lead.
async function ensureWelcomeTasks(
  lead: SalesforceLead,
  assignedToId: string,
  leadMetadata?: LeadMetadata | null,
): Promise<number> {
  const processingDate =
    toDateInTz(leadMetadata?.processingStartDate, "UTC") ?? todayInTz()
  const processingAge = daysBetween(processingDate, todayInTz())
  const agedFile = processingAge > WELCOME_TASK_AUTO_COMPLETE_DAYS

  const isPastProcessingStatus = lead.Status !== "Processing"
  const isPastWelcomeEmailFlow =
    isPastProcessingStatus && lead.Status !== "W.E. SENT"

  const isWECompleteStatus = lead.Status === "W.E. SENT"
  const isWCCompleteStatus = lead.Status === "W.C. Complete"

  const isWCComplete =
    isWCCompleteStatus ||
    agedFile ||
    leadMetadata?.welcomeCallCompletedAt ||
    isPastWelcomeEmailFlow

  const isWEComplete =
    isWCComplete ||
    isWECompleteStatus ||
    agedFile ||
    leadMetadata?.welcomeEmailCompletedAt ||
    isPastWelcomeEmailFlow

  return (
    await Promise.all([
      upsertTask({
        fileId: lead.Id,
        title: "Welcome Email",
        type: "welcome_email",
        assignedToId,
        dueDate: addDays(processingDate, 1),
        idempotencyKey: `${lead.Id}:welcome_email`,
        status: isWEComplete ? "Completed" : "Open",
        completedAt: leadMetadata?.welcomeEmailCompletedAt || processingDate,
      }),
      upsertTask({
        fileId: lead.Id,
        title: "Welcome Call",
        type: "welcome_call",
        assignedToId,
        dueDate: addDays(processingDate, 2),
        idempotencyKey: `${lead.Id}:welcome_call`,
        status: isWCComplete ? "Completed" : "Open",
        completedAt: leadMetadata?.welcomeCallCompletedAt || processingDate,
      }),
    ])
  ).filter(Boolean).length
}

// Layer 1 — external follow-up (lender + borrower, same due date).
async function ensureFollowUpTasks(
  lead: SalesforceLead,
  assignedToId: string,
  anchor: string,
): Promise<number> {
  const today = todayInTz()
  const daysUntilAnchor = daysBetween(today, anchor)

  // Do not create follow-ups that are nine or more days overdue.
  if (
    daysUntilAnchor > UPCOMING_WINDOW_DAYS ||
    daysUntilAnchor <= -STALE_FOLLOW_UP_DAYS
  ) {
    return 0
  }

  return (
    await Promise.all([
      upsertTask({
        fileId: lead.Id,
        title: "Follow Up: Call Lender",
        type: "follow_up_lender",
        assignedToId,
        dueDate: anchor,
        idempotencyKey: `${lead.Id}:follow_up_lender:${anchor}`,
      }),
      upsertTask({
        fileId: lead.Id,
        title: "Follow Up: Call Borrower",
        type: "follow_up_borrower",
        assignedToId,
        dueDate: anchor,
        idempotencyKey: `${lead.Id}:follow_up_borrower:${anchor}`,
      }),
    ])
  ).filter(Boolean).length
}

// Layer 2 — internal red flag. Fires only when a Layer 1 follow-up task is
// still open and past its due date (the agent was notified but didn't act).
async function ensureRedFlagTask(
  lead: SalesforceLead,
  assignedToId: string,
): Promise<number> {
  const today = todayInTz()
  const rows = await db.execute({
    sql: `SELECT due_date FROM tasks
      WHERE file_id = ? AND type IN ('follow_up_lender','follow_up_borrower')
        AND status = 'Open' AND due_date IS NOT NULL AND due_date < ?
      ORDER BY due_date ASC LIMIT 1`,
    args: [lead.Id, today],
  })

  if (rows.rows.length === 0) return 0

  const overdueDue = String(rows.rows[0].due_date)
  const created = await upsertTask({
    fileId: lead.Id,
    title: "Internal Follow-Up: What's the status?",
    type: "internal_red_flag",
    assignedToId,
    dueDate: addDays(today, 1),
    idempotencyKey: `${lead.Id}:internal_red_flag:${overdueDue}`,
  })

  return created ? 1 : 0
}

// Runs the full generation for a single lead. Returns counts for logging.
export async function generateTasksForLead(
  lead: SalesforceLead,
  assignedToId: string,
): Promise<{ created: number }> {
  if (HALTED_STATUSES.has(lead.Status)) return { created: 0 }

  let created = 0

  const metadata = await getLeadMetadata(lead.Id)
  created += await ensureWelcomeTasks(lead, assignedToId, metadata)

  // Do not create follow-up tasks until the welcome call has been completed.
  // We wait for the welcomeCallCompletedAt event to exist before starting the
  // follow-up cadence.
  if (!metadata?.welcomeCallCompletedAt) return { created }

  const anchor = resolveAnchor(lead, {
    welcomeCallCompletedAt: metadata.welcomeCallCompletedAt,
  })

  if (anchor) {
    created += (
      await Promise.all([
        ensureFollowUpTasks(lead, assignedToId, anchor),
        ensureRedFlagTask(lead, assignedToId),
      ])
    ).reduce((sum, n) => sum + n, 0)
  }

  return { created }
}
