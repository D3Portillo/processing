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

function normalizeLead(lead: SalesforceLead): SalesforceLead {
  return {
    ...lead,
    Name: lead.Name.replace(/\s+Sale Date\s*(?::|-).*$/i, "").trim(),
  }
}

export async function getActiveLeads(): Promise<SalesforceLead[]> {
  const token = await getToken()
  const [leads, history] = await Promise.all([
    sfQuery<Omit<SalesforceLead, "ProcessingStartDate">>(
      ACTIVE_LEADS_QUERY,
      token,
    ),
    getProcessingLeadHistory(token),
  ])
  const processingDates = getLatestProcessingDates(history)

  console.debug({
    totalLeads: leads.length,
    totalHistory: history.length,
    totalProcessingDates: processingDates.size,
  })

  return leads
    .map((lead) => {
      const processingStartDate = processingDates.get(lead.Id)
      if (!processingStartDate) return null

      return normalizeLead({
        ...lead,
        ProcessingStartDate: processingStartDate,
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
  return history.filter((entry) => entry.NewValue === "Processing")
}

function getLatestProcessingDates(
  history: SalesforceLeadHistory[],
): Map<string, string> {
  const dates = new Map<string, string>()

  for (const entry of history) {
    const previousDate = dates.get(entry.LeadId)
    // Get latest processing date for each lead, since the history is sorted by CreatedDate DESC.
    if (!previousDate) {
      dates.set(entry.LeadId, entry.CreatedDate)
    }
  }

  return dates
}
