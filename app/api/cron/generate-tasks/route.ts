import { NextResponse } from "next/server"
import { getActiveLeads, filterLeadsForTaskGeneration } from "@/app/lib/sf-leads"
import { generateTasksForLead } from "@/app/lib/task-generation"
import { PROCESSING_TEAM } from "@/app/lib/owners"

// Daily job (Vercel Cron, America/Los_Angeles). Reads active leads from
// Salesforce (read-only) and generates follow-up tasks into Turso.
export async function GET() {
  try {
    const allLeads = await getActiveLeads()
    // Only process leads that matter: created in the last 30 days, or with a
    // next follow-up within 30 days. Skip the rest.
    const leads = filterLeadsForTaskGeneration(allLeads)
    const ownerMap = new Map(PROCESSING_TEAM.map((o) => [o.Id, o]))

    let created = 0
    let processed = 0

    for (const lead of leads) {
      const owner = ownerMap.get(lead.OwnerId ?? "")
      if (!owner) continue

      processed += 1
      const result = await generateTasksForLead(lead, owner.Id)
      created += result.created
    }

    console.debug({
      totalLeads: allLeads.length,
      filteredLeads: leads.length,
      processed,
      created,
    })

    return NextResponse.json({
      totalLeads: allLeads.length,
      filteredLeads: leads.length,
      processed,
      created,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate tasks"
    console.error(message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
