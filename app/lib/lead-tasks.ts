import type { SalesforceLead } from "./sf-leads"
import { HALTED_STATUSES } from "./sf-leads"
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

// Max 7-day follow-up cycles when there's no underwriting start date yet.
// 13 cycles ≈ 91 days of follow-ups before the lead enters underwriting.
const MAX_FOLLOW_UP_CYCLES = 13

// For the demo: assume past tasks were done. If the last lender call was
// 2 days ago, every lender task due on or before that date is completed.
// Same for borrower tasks vs last status update.
function applyLastActivity(
  tasks: Task[],
  lastLenderCall: string | null,
  lastStatusUpdate: string | null,
): Task[] {
  return tasks.map((t) => {
    if (t.status === "Completed" || !t.dueDate) return t

    const isLenderTask = t.id.includes("lender")
    const cutoff = isLenderTask ? lastLenderCall : lastStatusUpdate

    if (cutoff && t.dueDate <= cutoff) {
      return { ...t, status: "Completed" as const, completedAt: t.dueDate }
    }

    return t
  })
}

export function deriveLeadTasks(
  lead: SalesforceLead,
  assignedTo: Specialist,
): Task[] {
  // Halted leads (denied, closed, unresponsive, etc) show no tasks.
  if (HALTED_STATUSES.has(lead.Status)) return []

  const assignedAt = lead.ProcessingStartDate
  const welcomeComplete = WELCOME_COMPLETE_STATUSES.has(lead.Status)

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

  // 7-day follow-ups — repeat every 7 days until:
  //   - underwriting starts
  //   - missing documents pause
  //   - lead is halted (denied, unresponsive, etc)
  const followUpStartDate = addDays(dueDateWelcomeCall, 7)
  const uwStart = toDate(lead.UnderwritingStartDate)
  const uwEnd = toDate(lead.UnderwritingEndDate)
  const missingDocs = toDate(lead.MissingDocsDate)
  const halted = toDate(lead.HaltedDate)

  let cycle = 1
  let dueDate = followUpStartDate
  while (cycle <= MAX_FOLLOW_UP_CYCLES) {
    if (uwStart && dueDate >= uwStart) break
    if (missingDocs && dueDate >= missingDocs) break
    if (halted && dueDate >= halted) break

    tasks.push(
      task(lead, assignedTo, {
        id: `lender-follow-up-${cycle}`,
        title: `7 Day Follow Up: Call Lender (${cycle})`,
        dueDate,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: `borrower-follow-up-${cycle}`,
        title: `7 Day Follow Up: Call Borrower (${cycle})`,
        dueDate,
        status: "Open",
        completedAt: null,
      }),
    )

    cycle++
    dueDate = addDays(dueDate, 7)
  }

  // 14-day underwriting follow-ups — only while the lead is CURRENTLY in
  // underwriting. If UnderwritingEndDate exists (status changed away from
  // UNDERWRITING), no UW follow-ups are generated.
  if (uwStart && !uwEnd) {
    const uwCycle1 = addDays(uwStart, 13)
    const uwCycle2 = addDays(uwStart, 27)
    const uwCycle3 = addDays(uwStart, 41)

    tasks.push(
      task(lead, assignedTo, {
        id: "uw-follow-up-1-lender",
        title: "14 Day UW Follow Up: Call Lender (1)",
        dueDate: uwCycle1,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: "uw-follow-up-1-borrower",
        title: "14 Day UW Follow Up: Call Borrower (1)",
        dueDate: uwCycle1,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: "uw-follow-up-2-lender",
        title: "14 Day UW Follow Up: Call Lender (2)",
        dueDate: uwCycle2,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: "uw-follow-up-2-borrower",
        title: "14 Day UW Follow Up: Call Borrower (2)",
        dueDate: uwCycle2,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: "uw-follow-up-3-lender",
        title: "14 Day UW Follow Up: Call Lender (3)",
        dueDate: uwCycle3,
        status: "Open",
        completedAt: null,
      }),
      task(lead, assignedTo, {
        id: "uw-follow-up-3-borrower",
        title: "14 Day UW Follow Up: Call Borrower (3)",
        dueDate: uwCycle3,
        status: "Open",
        completedAt: null,
      }),
    )
  }

  // Demo: auto-complete past tasks based on last activity dates.
  // Lender tasks → Last_Lender_Call__c, borrower tasks → Last_Status_Update__c.
  const lastLenderCall = toDate(lead.Last_Lender_Call__c)
  const lastStatusUpdate = toDate(lead.Last_Status_Update__c)

  return applyLastActivity(tasks, lastLenderCall, lastStatusUpdate)
}