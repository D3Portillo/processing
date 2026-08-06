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
  welcomeEmailCompletedAt: string | null
  welcomeCallCompletedAt: string | null
}

const METADATA_KEY_PREFIX = "processing.lead.metadata"
const LEAD_ID_BATCH_SIZE = 500
const REDIS_BATCH_SIZE = 500

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

// Welcome email and call completion are recorded only when history records a
// transition FROM their corresponding status. No status-set inference is used.
export function foldHistoryToMetadata(
  history: SalesforceLeadHistory[],
): LeadMetadata {
  let processingStartDate: string | null = null
  let welcomeEmailCompletedAt: string | null = null
  let welcomeCallCompletedAt: string | null = null

  for (const entry of history) {
    if (entry.NewValue === "Processing" && !processingStartDate) {
      processingStartDate = entry.CreatedDate
    }

    if (entry.OldValue === "W.E. SENT" && !welcomeEmailCompletedAt) {
      welcomeEmailCompletedAt = entry.CreatedDate
    }

    if (entry.OldValue === "W.C. Complete" && !welcomeCallCompletedAt) {
      welcomeCallCompletedAt = entry.CreatedDate
    }
  }

  return {
    processingStartDate,
    welcomeEmailCompletedAt,
    welcomeCallCompletedAt,
  }
}

export async function upsertLeadMetadataBatch(
  updates: Array<{ leadId: string; metadata: LeadMetadata }>,
): Promise<void> {
  for (let i = 0; i < updates.length; i += REDIS_BATCH_SIZE) {
    const batch = updates.slice(i, i + REDIS_BATCH_SIZE)
    const keys = batch.map(({ leadId }) => metadataKey(leadId))
    const existing = await redis.mget<(LeadMetadata | null)[]>(keys)
    const values: Record<string, LeadMetadata> = {}

    for (const [index, update] of batch.entries()) {
      const current = existing[index]
      values[keys[index]] = {
        processingStartDate:
          update.metadata.processingStartDate ??
          current?.processingStartDate ??
          null,
        welcomeEmailCompletedAt:
          update.metadata.welcomeEmailCompletedAt ??
          current?.welcomeEmailCompletedAt ??
          null,
        welcomeCallCompletedAt:
          update.metadata.welcomeCallCompletedAt ??
          current?.welcomeCallCompletedAt ??
          null,
      }
    }

    await redis.mset(values)
  }
}

export async function getLeadMetadata(
  leadId: string,
): Promise<LeadMetadata | null> {
  return redis.get<LeadMetadata>(metadataKey(leadId))
}
