import { NextResponse } from "next/server"
import { getActiveLeads } from "@/app/lib/sf-leads"
import {
  foldHistoryToMetadata,
  getLeadHistoryForLeads,
  upsertLeadMetadata,
} from "@/app/lib/lead-metadata"

// Hourly job: syncs recent LeadHistory into one Redis metadata key per lead.
export async function GET() {
  try {
    const leads = await getActiveLeads()
    const createdAfter = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString()
    const history = await getLeadHistoryForLeads(
      leads.map((lead) => lead.Id),
      createdAfter,
    )

    const byLead = new Map<string, typeof history>()
    for (const entry of history) {
      const entries = byLead.get(entry.LeadId) ?? []
      entries.push(entry)
      byLead.set(entry.LeadId, entries)
    }

    let updated = 0
    for (const lead of leads) {
      const entries = byLead.get(lead.Id)
      if (!entries?.length) continue

      await upsertLeadMetadata(lead.Id, foldHistoryToMetadata(entries))
      updated += 1
    }

    return NextResponse.json({
      totalLeads: leads.length,
      historyRecords: history.length,
      updated,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync lead metadata"
    console.error(message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
