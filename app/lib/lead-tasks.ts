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
    createdAt: lead.ProcessingStartDate,
    completedAt: input.completedAt,
  }
}

export function deriveLeadTasks(
  lead: SalesforceLead,
  assignedTo: Specialist,
): Task[] {
  const assignedAt = lead.ProcessingStartDate
  const welcomeComplete = WELCOME_COMPLETE_STATUSES.has(lead.Status)
  const lastLenderCall = toDate(lead.Last_Lender_Call__c)
  const lastStatusUpdate = toDate(lead.Last_Status_Update__c)
  const nextStatusUpdate = toDate(lead.Next_Status_Update__c)

  const dueDateWelcomeEmail = addDays(assignedAt, 1)
  const dueDateWelcomeCall = addDays(assignedAt, 2)

  const tasks: Task[] = [
    task(lead, assignedTo, {
      id: "welcome-email",
      title: "Welcome Email",
      dueDate: dueDateWelcomeEmail,
      status: welcomeComplete ? "Completed" : "Open",
      completedAt: welcomeComplete ? dueDateWelcomeEmail : null,
    }),
    task(lead, assignedTo, {
      id: "welcome-call",
      title: "Welcome Call",
      dueDate: dueDateWelcomeCall,
      status: welcomeComplete ? "Completed" : "Open",
      completedAt: welcomeComplete ? dueDateWelcomeCall : null,
    }),
  ]

  const followUpStartDate = addDays(dueDateWelcomeCall, 7)

  // Initial 7 day follow-ups (x3)
  tasks.push(
    // First Follow Up
    task(lead, assignedTo, {
      id: "lender-follow-up-1",
      title: "7 Day Follow Up: Call Lender (1)",
      dueDate: followUpStartDate,
      status: "Open",
      completedAt: null,
    }),
    task(lead, assignedTo, {
      id: "borrower-follow-up-1",
      title: "7 Day Follow Up: Call Borrower (1)",
      dueDate: followUpStartDate,
      status: "Open",
      completedAt: null,
    }),

    // Second Follow Up
    task(lead, assignedTo, {
      id: "lender-follow-up-2",
      title: "7 Day Follow Up: Call Lender (2)",
      dueDate: addDays(followUpStartDate, 7),
      status: "Open",
      completedAt: null,
    }),
    task(lead, assignedTo, {
      id: "borrower-follow-up-2",
      title: "7 Day Follow Up: Call Borrower (2)",
      dueDate: addDays(followUpStartDate, 7),
      status: "Open",
      completedAt: null,
    }),

    // Third Follow Up
    task(lead, assignedTo, {
      id: "lender-follow-up-3",
      title: "7 Day Follow Up: Call Lender (3)",
      dueDate: addDays(followUpStartDate, 14),
      status: "Open",
      completedAt: null,
    }),
    task(lead, assignedTo, {
      id: "borrower-follow-up-3",
      title: "7 Day Follow Up: Call Borrower (3)",
      dueDate: addDays(followUpStartDate, 14),
      status: "Open",
      completedAt: null,
    }),
  )

  // Add UNDERWRITING follow-up tasks if applicable

  return tasks
}
