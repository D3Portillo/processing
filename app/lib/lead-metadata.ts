import { getToken, sfQuery } from "./sf"
import { redis } from "./redis"

export interface SalesforceLeadHistory {
  Id: string
  LeadId: string
  Field: string
  OldValue: string | null
  NewValue: string | null
  CreatedDate: string
}

export interface LeadMetadata {
  processingStartDate: string | null
  welcomeCallCompleted: boolean
  welcomeCallCompletedAt: string | null
}

const METADATA_KEY_PREFIX = "processing.lead.metadata"
const LEAD_ID_BATCH_SIZE = 500

function metadataKey(leadId: string): string {
  return `${METADATA_KEY_PREFIX}:${leadId}`
}

export async function getLeadHistoryForLeads(
  leadIds: string[],
  createdAfter?: string,
): Promise<SalesforceLeadHistory[]> {
  if (leadIds.length === 0) return []

  const token = await getToken()
  const timeFilter = createdAfter ? ` AND CreatedDate >= ${createdAfter}` : ""
  const all: SalesforceLeadHistory[] = []

  for (let i = 0; i < leadIds.length; i += LEAD_ID_BATCH_SIZE) {
    const batch = leadIds.slice(i, i + LEAD_ID_BATCH_SIZE)
    const idFilter = batch.map((id) => `'${id}'`).join(",")
    const soql = `SELECT Id, LeadId, Field, OldValue, NewValue, CreatedDate
FROM LeadHistory
WHERE LeadId IN (${idFilter}) AND Field = 'Status'${timeFilter}
ORDER BY CreatedDate ASC`

    all.push(...(await sfQuery<SalesforceLeadHistory>(soql, token)))
  }

  return all
}

// The welcome call is complete only when history records a transition FROM
// "Welcome Call" to any other status. No status-set inference is used.
export function foldHistoryToMetadata(
  history: SalesforceLeadHistory[],
): LeadMetadata {
  let processingStartDate: string | null = null
  let welcomeCallCompletedAt: string | null = null

  for (const entry of history) {
    if (entry.NewValue === "Processing" && !processingStartDate) {
      processingStartDate = entry.CreatedDate
    }

    if (entry.OldValue === "W.C. Complete" && !welcomeCallCompletedAt) {
      welcomeCallCompletedAt = entry.CreatedDate
    }
  }

  return {
    processingStartDate,
    welcomeCallCompleted: welcomeCallCompletedAt !== null,
    welcomeCallCompletedAt,
  }
}

export async function upsertLeadMetadata(
  leadId: string,
  metadata: LeadMetadata,
): Promise<void> {
  const key = metadataKey(leadId)
  const existing = await redis.get<LeadMetadata>(key)

  const merged: LeadMetadata = {
    processingStartDate:
      metadata.processingStartDate ?? existing?.processingStartDate ?? null,
    welcomeCallCompleted:
      existing?.welcomeCallCompleted || metadata.welcomeCallCompleted,
    welcomeCallCompletedAt:
      metadata.welcomeCallCompletedAt ??
      existing?.welcomeCallCompletedAt ??
      null,
  }

  await redis.set(key, merged)
}

export async function getLeadMetadata(
  leadId: string,
): Promise<LeadMetadata | null> {
  return redis.get<LeadMetadata>(metadataKey(leadId))
}
