import { sfQuery } from "./sf"
import owners from "@/data/salesforce-owners.json"

export interface SalesforceOwner {
  Id: string
  Name: string
  Email: string | null
  AvatarUrl?: string | null
}

export const SALESFORCE_OWNERS = (owners as SalesforceOwner[]).filter((o) =>
  o.Email?.includes("retentiongroup.org"),
)

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
  Next_Status_Update__c: string | null
  Last_Lender_Call__c: string | null
  Sale_Date_On_Property__c: string | null
}

const ACTIVE_LEAD_STATUSES = [
  "Retainer Agreement Signed",
  "Processing",
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
  "DENIED",
  "Non-Compliance",
  "BK",
  "Qualified",
  "Refunded",
  "UNRSPSV",
  "Non-Payment",
  "Closed",
] as const

const STATUS_LIST = ACTIVE_LEAD_STATUSES.map((status) => `'${status}'`).join(
  ", ",
)

export const ACTIVE_LEADS_QUERY = `
SELECT Email, OwnerId, Phone, LastModifiedDate, CreatedDate, Loan_Number__c, What_type_of_loan_do_they_have__c, Id, Name, Status, Lender__c, QWR_RMA_Lender_Phone_Number__c, Underwriting_Lender_Phone_Number__c, Next_Status_Update__c, Last_Lender_Call__c, Sale_Date_On_Property__c
FROM Lead
WHERE Status IN (${STATUS_LIST})
AND CreatedDate = THIS_YEAR
AND OwnerId != '005Pm000003PUveIAG'
ORDER BY CreatedDate DESC`

function normalizeLead(lead: SalesforceLead): SalesforceLead {
  return {
    ...lead,
    Name: lead.Name.replace(/\s+Sale Date\s*(?::|-).*$/i, "").trim(),
  }
}

export async function getActiveLeads(): Promise<SalesforceLead[]> {
  const leads = await sfQuery<SalesforceLead>(ACTIVE_LEADS_QUERY)
  return leads.map(normalizeLead)
}

export async function getActiveLeadOwners(): Promise<SalesforceOwner[]> {
  return sfQuery<SalesforceOwner>(`
SELECT Id, Name, Email
FROM User
WHERE IsActive = true
ORDER BY Name`)
}
