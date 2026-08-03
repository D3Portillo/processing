import { getToken, sfQuery } from "./sf"
import owners from "@/data/salesforce-owners.json"

export interface SalesforceOwner {
  Id: string
  Name: string
  isProcessingTeamMember?: boolean
  Email: string | null
  AvatarUrl?: string | null
}

export const ALL_USERS = (owners as SalesforceOwner[]).filter((o) =>
  o.Email?.includes("retentiongroup.org"),
)

export const PROCESSING_TEAM = ALL_USERS.filter((o) => o.isProcessingTeamMember)

export interface SalesforceLead {
  Email: string | null
  OwnerId: string | null
  Phone: string | null
  LastModifiedDate: string
  CreatedDate: string
  Loan_Number__c: string | null
  What_type_of_loan_do_they_have__c: string | null
  Id: string
  Name: string
  Status: string
  Lender__c: string | null
  QWR_RMA_Lender_Phone_Number__c: string | null
  Underwriting_Lender_Phone_Number__c: string | null
  Last_Status_Update__c: string | null
  Next_Status_Update__c: string | null
  Last_Lender_Call__c: string | null
  Sale_Date_On_Property__c: string | null
  ProcessingStartDate: string
  UnderwritingStartDate: string | null
  UnderwritingEndDate: string | null
  MissingDocsDate: string | null
  HaltedDate: string | null
}

export interface SalesforceLeadHistory {
  Id: string
  LeadId: string
  Field: string
  OldValue: string | null
  NewValue: string | null
  CreatedDate: string
}

export const ACTIVE_LEADS_QUERY = `
SELECT Email, OwnerId, Phone, LastModifiedDate, CreatedDate, Loan_Number__c, What_type_of_loan_do_they_have__c, Id, Name, Status, Lender__c, QWR_RMA_Lender_Phone_Number__c, Underwriting_Lender_Phone_Number__c, Last_Status_Update__c, Next_Status_Update__c, Last_Lender_Call__c, Sale_Date_On_Property__c
FROM Lead
WHERE OwnerId IN (${PROCESSING_TEAM.map((u) => `'${u.Id}'`).join(",")})
ORDER BY LastModifiedDate DESC`

export const PROCESSING_LEAD_HISTORY_QUERY = `
SELECT Id, LeadId, Field, OldValue, NewValue, CreatedDate
FROM LeadHistory
WHERE Field = 'Status'
ORDER BY CreatedDate DESC`

// Terminal statuses — dead ends where follow-ups should stop
const HALTED_STATUSES = new Set([
  "DENIED",
  "UNRSPSV",
  "Unqualified",
  "Non-Payment",
  "Closed",
  "Refunded",
])

function normalizeLead(lead: SalesforceLead): SalesforceLead {
  return {
    ...lead,
    Name: lead.Name.replace(/\s+Sale Date\s*(?::|-).*$/i, "").trim(),
  }
}

export async function getActiveLeads(): Promise<SalesforceLead[]> {
  const token = await getToken()
  const [leads, history] = await Promise.all([
    sfQuery<
      Omit<SalesforceLead, "ProcessingStartDate" | "UnderwritingStartDate" | "UnderwritingEndDate" | "MissingDocsDate" | "HaltedDate">
    >(ACTIVE_LEADS_QUERY, token),
    getProcessingLeadHistory(token),
  ])
  const processingDates = getLatestStatusDates(history, "Processing")
  const underwritingStartDates = getLatestStatusDates(history, "UNDERWRITING")
  const underwritingEndDates = getLatestStatusExitDates(history, "UNDERWRITING")
  const missingDocsDates = getLatestStatusDates(history, "Missing Documents")
  const haltedDates = getLatestStatusInSetDates(history, HALTED_STATUSES)

  console.debug({
    totalLeads: leads.length,
    totalHistory: history.length,
    totalProcessingDates: processingDates.size,
    totalUnderwritingStartDates: underwritingStartDates.size,
    totalUnderwritingEndDates: underwritingEndDates.size,
    totalMissingDocsDates: missingDocsDates.size,
    totalHaltedDates: haltedDates.size,
  })

  return leads
    .map((lead) => {
      const processingStartDate = processingDates.get(lead.Id)
      if (!processingStartDate) return null

      return normalizeLead({
        ...lead,
        ProcessingStartDate: processingStartDate,
        UnderwritingStartDate: underwritingStartDates.get(lead.Id) ?? null,
        UnderwritingEndDate: underwritingEndDates.get(lead.Id) ?? null,
        MissingDocsDate: missingDocsDates.get(lead.Id) ?? null,
        HaltedDate: haltedDates.get(lead.Id) ?? null,
      })
    })
    .filter((lead): lead is SalesforceLead => lead !== null)
}

export async function getActiveLeadOwners(): Promise<SalesforceOwner[]> {
  return sfQuery<SalesforceOwner>(`
SELECT Id, Name, Email
FROM User
WHERE IsActive = true
ORDER BY Name`)
}

export async function getProcessingLeadHistory(
  token?: string,
): Promise<SalesforceLeadHistory[]> {
  const history = await sfQuery<SalesforceLeadHistory>(
    PROCESSING_LEAD_HISTORY_QUERY,
    token,
  )
  return history
}

function getLatestStatusDates(
  history: SalesforceLeadHistory[],
  status: string,
): Map<string, string> {
  const dates = new Map<string, string>()

  for (const entry of history) {
    if (entry.NewValue !== status) continue

    // History is sorted by CreatedDate DESC, so the first matching entry
    // is the latest time the lead entered this status.
    if (!dates.has(entry.LeadId)) {
      dates.set(entry.LeadId, entry.CreatedDate)
    }
  }

  return dates
}

// Finds the most recent date a lead EXITED the given status — i.e. the
// lead's status changed FROM `status` to something else. History is sorted
// by CreatedDate DESC, so the first matching entry is the latest exit.
function getLatestStatusExitDates(
  history: SalesforceLeadHistory[],
  status: string,
): Map<string, string> {
  const dates = new Map<string, string>()

  for (const entry of history) {
    if (entry.OldValue !== status) continue
    if (entry.NewValue === status) continue

    if (!dates.has(entry.LeadId)) {
      dates.set(entry.LeadId, entry.CreatedDate)
    }
  }

  return dates
}

// Finds the most recent date a lead entered ANY status in the given set.
// History is sorted by CreatedDate DESC, so the first matching entry wins.
function getLatestStatusInSetDates(
  history: SalesforceLeadHistory[],
  statuses: Set<string>,
): Map<string, string> {
  const dates = new Map<string, string>()

  for (const entry of history) {
    if (!entry.NewValue || !statuses.has(entry.NewValue)) continue

    if (!dates.has(entry.LeadId)) {
      dates.set(entry.LeadId, entry.CreatedDate)
    }
  }

  return dates
}