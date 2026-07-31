import type { SalesforceLead } from "./sf-leads"
import type { Specialist, Task } from "./types"

const WELCOME_COMPLETE_STATUSES = new Set([
  "W.E. SENT",
  "W.C. Complete",
  "TPA PENDING",
  "SUB PENDING",
  "QWR/RMA",
  "QWR ONLY",
  "Missing Documents",
  "UNDERWRITING",
  "Escalation",
  "Approved Pending Docs",
  "APPROVED",
  "Hard Money",
  "DENIED",
  "Non-Compliance",
  "BK",
  "Qualified",
  "Refunded",
  "UNRSPSV",
  "Unqualified",
  "Non-Payment",
  "Closed",
])
const FOLLOW_UP_STATUSES = new Set([
  "TPA PENDING",
  "SUB PENDING",
  "W.E. SENT",
  "UNDERWRITING",
  "Missing Documents",
  "Escalation",
])

function addDays(value: string, days: number): string {
  const date = new Date(value)
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function toDate(value: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function task(
  lead: SalesforceLead,
  assignedTo: Specialist,
  input: {
    id: string
    title: string
    dueDate: string | null
    status: "Open" | "Completed"
    completedAt: string | null
  },
): Task {
  return {
    id: `${lead.Id}:${input.id}`,
    fileId: lead.Id,
    title: input.title,
    description: null,
    assignedTo,
    dueDate: input.dueDate,
    status: input.status,
    createdAt: lead.CreatedDate,
    completedAt: input.completedAt,
  }
}

export function deriveLeadTasks(
  lead: SalesforceLead,
  assignedTo: Specialist,
): Task[] {
  const welcomeComplete = WELCOME_COMPLETE_STATUSES.has(lead.Status)
  const welcomeCompletedAt = welcomeComplete ? lead.LastModifiedDate : null
  const tasks = [
    task(lead, assignedTo, {
      id: "welcome-email",
      title: "Welcome Email",
      dueDate: lead.CreatedDate,
      status: welcomeComplete ? "Completed" : "Open",
      completedAt: welcomeCompletedAt,
    }),
    task(lead, assignedTo, {
      id: "welcome-call",
      title: "Welcome Call",
      dueDate: addDays(lead.CreatedDate, 1),
      status: welcomeComplete ? "Completed" : "Open",
      completedAt: welcomeCompletedAt,
    }),
  ]

  if (FOLLOW_UP_STATUSES.has(lead.Status)) {
    const followUpBase =
      toDate(lead.Last_Lender_Call__c) ?? toDate(lead.Next_Status_Update__c)
    tasks.push(
      task(lead, assignedTo, {
        id: "lender-follow-up",
        title: "7 Day Follow Up: Call Lender",
        dueDate: followUpBase ? addDays(followUpBase, 7) : null,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: "borrower-follow-up",
        title: "7 Day Follow Up: Call Borrower",
        dueDate: followUpBase ? addDays(followUpBase, 7) : null,
        status: "Open",
        completedAt: null,
      }),
    )
  }

  return tasks
}