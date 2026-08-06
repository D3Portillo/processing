import "dotenv/config"
import { getActiveLeads } from "../app/lib/sf-leads"
import {
  foldHistoryToMetadata,
  getLeadHistoryForLeads,
  upsertLeadMetadata,
} from "../app/lib/lead-metadata"

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

  let updated = 0
  for (const lead of leads) {
    await upsertLeadMetadata(
      lead.Id,
      foldHistoryToMetadata(byLead.get(lead.Id) ?? []),
    )
    updated += 1
  }

  console.log(
    `Synced metadata for ${updated} leads (${history.length} history records)`,
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
