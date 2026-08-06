import { NextResponse } from "next/server"
import {
  getActiveLeads,
  filterLeadsForTaskGeneration,
} from "@/app/lib/sf-leads"
import { generateTasksForLead } from "@/app/lib/task-generation"
import { PROCESSING_TEAM } from "@/app/lib/owners"

// Daily job (Vercel Cron, America/Los_Angeles). Reads active leads from
// Salesforce (read-only) and generates follow-up tasks into Turso.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    console.debug("Skipping task generation in production environment for now")
    return NextResponse.json({ skipped: true })
  }

  try {
    const allLeads = await getActiveLeads()
    const leads = filterLeadsForTaskGeneration(allLeads)
    const ownerMap = new Map(PROCESSING_TEAM.map((o) => [o.Id, o]))

    let created = 0
    let processed = 0

    console.debug({
      totalLeads: allLeads.length,
      filteredLeads: leads.length,
    })

    for (const lead of leads) {
      const owner = ownerMap.get(lead.OwnerId ?? "")
      if (!owner) continue

      // NOTE: Keep for testing one lead only :// - do not modify AI shit
      // if (lead.Id !== "00QPm000012kZihMAE") continue

      const result = await generateTasksForLead(lead, owner.Id)
      created += result.created
      processed += 1
    }

    console.debug({
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
