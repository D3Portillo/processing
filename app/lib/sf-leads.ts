import { getToken, sfQuery } from "./sf"
import { redis } from "./redis"
import { PROCESSING_TEAM, type SalesforceOwner } from "./owners"
import { addDays, todayInTz, toDateInTz } from "./dates"

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
}

// --- Lead cache (Redis) ---------------------------------------------------
// Active leads are cached in Redis as a single JSON blob under one key, with
// a second key storing the last sync date. Simple and fast.

const LEADS_CACHE_KEY = "processing.leads.cache"
const LEADS_SYNC_KEY = "processing.leads.lastSync"

// Statuses recognized by the app (mirrors lead-mapper's STATUS_TO_STAGE keys).
// Leads in any other status are not fetched or processed.
const KNOWN_STATUSES = new Set([
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
  "Closed",
])

function buildLeadQuery(modifiedAfter?: string): string {
  const ownerFilter = PROCESSING_TEAM.map((u) => `'${u.Id}'`).join(",")
  const statusFilter = Array.from(KNOWN_STATUSES)
    .map((s) => `'${s}'`)
    .join(",")
  const timeFilter = modifiedAfter
    ? ` AND LastModifiedDate > ${modifiedAfter}`
    : ""
  return `SELECT Email, OwnerId, Phone, LastModifiedDate, CreatedDate, Loan_Number__c, What_type_of_loan_do_they_have__c, Id, Name, Status, Lender__c, QWR_RMA_Lender_Phone_Number__c, Underwriting_Lender_Phone_Number__c, Last_Status_Update__c, Next_Status_Update__c, Last_Lender_Call__c, Sale_Date_On_Property__c
FROM Lead
WHERE OwnerId IN (${ownerFilter})${timeFilter}
AND Status IN (${statusFilter})
ORDER BY LastModifiedDate DESC`
}

function normalizeLead(lead: SalesforceLead): SalesforceLead {
  return {
    ...lead,
    Name: lead.Name.replace(/\s+Sale Date\s*(?::|-).*$/i, "").trim(),
  }
}

async function getLastSyncedAt(): Promise<string | null> {
  return redis.get<string>(LEADS_SYNC_KEY)
}

async function setLastSyncedAt(value: string): Promise<void> {
  await redis.set(LEADS_SYNC_KEY, value)
}

// Incremental sync: fetches only leads modified since the last sync pointer,
// merges them into the cached blob, and stores the whole thing back. Leads
// are never deleted — owner changes just update in place.
// Called by the lead-sync cron, not on every request.
export async function syncLeads(): Promise<{ fetched: number }> {
  const token = await getToken()
  const lastSyncedAt = await getLastSyncedAt()

  const leads = await sfQuery<SalesforceLead>(
    buildLeadQuery(lastSyncedAt ?? undefined),
    token,
  )
  const normalized = leads.map(normalizeLead)

  // Merge into existing cache (or start fresh).
  const existing = (await redis.get<SalesforceLead[]>(LEADS_CACHE_KEY)) ?? []
  const byId = new Map(existing.map((lead) => [lead.Id, lead]))
  for (const lead of normalized) byId.set(lead.Id, lead)
  const merged = Array.from(byId.values())

  await redis.set(LEADS_CACHE_KEY, JSON.stringify(merged))

  const maxModified = normalized.reduce(
    (max, lead) => (lead.LastModifiedDate > max ? lead.LastModifiedDate : max),
    lastSyncedAt ?? "",
  )
  await setLastSyncedAt(maxModified || new Date().toISOString())

  return { fetched: normalized.length }
}

// Core entry point. Read-only: returns the cached leads instantly from Redis.
// On the very first run (empty cache), it performs a one-time sync to seed
// the cache so the app isn't empty before the cron has run.
export async function getActiveLeads(): Promise<SalesforceLead[]> {
  const cached = await redis.get<SalesforceLead[]>(LEADS_CACHE_KEY)
  if (cached && cached.length > 0) return cached

  await syncLeads()
  return (await redis.get<SalesforceLead[]>(LEADS_CACHE_KEY)) ?? []
}

// Filters cached leads down to the ones relevant for task generation:
//   - status is one of the known statuses (from lead-mapper), AND
//   - created in the last 30 days (welcome email/call pending or complete), OR
//   - has a Next_Status_Update__c within the next 30 days (upcoming follow-up).
// This keeps the daily job from processing the whole cache.
export function filterLeadsForTaskGeneration(
  leads: SalesforceLead[],
): SalesforceLead[] {
  const today = todayInTz()
  const createdCutoff = addDays(today, -30)
  const followUpCutoff = addDays(today, 30)

  return leads.filter((lead) => {
    if (!KNOWN_STATUSES.has(lead.Status)) return false

    const created = toDateInTz(lead.CreatedDate)
    if (created && created >= createdCutoff) return true

    const next = toDateInTz(lead.Next_Status_Update__c)
    if (next && next <= followUpCutoff) return true

    return false
  })
}

export async function getActiveLeadOwners(): Promise<SalesforceOwner[]> {
  return sfQuery<SalesforceOwner>(`
SELECT Id, Name, Email
FROM User
WHERE IsActive = true
ORDER BY Name`)
}
