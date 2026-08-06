import "dotenv/config"
import { getActiveLeads } from "../app/lib/sf-leads"
import {
  foldHistoryToMetadata,
  getLeadHistoryForLeads,
  upsertLeadMetadataBatch,
} from "@/app/lib/lead-metadata"

// Initial backfill of one Redis metadata key per active lead.
async function main() {
  const leads = await getActiveLeads()
  const history = await getLeadHistoryForLeads(leads.map((lead) => lead.Id))

  const byLead = new Map<string, typeof history>()
  for (const entry of history) {
    const entries = byLead.get(entry.LeadId) ?? []
    entries.push(entry)
    byLead.set(entry.LeadId, entries)
  }

  const updates = leads.map((lead) => ({
    leadId: lead.Id,
    metadata: foldHistoryToMetadata(byLead.get(lead.Id) ?? []),
  }))

  await upsertLeadMetadataBatch(updates)

  console.log(
    `Synced metadata for ${updates.length} leads (${history.length} history records)`,
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
