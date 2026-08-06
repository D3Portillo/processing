import { NextResponse } from "next/server"
import { syncLeads } from "@/app/lib/sf-leads"

// Keeps the lead cache fresh. Runs on a schedule (Vercel Cron) so that
// GET /api/leads stays read-only and fast.
export async function GET() {
  try {
    const result = await syncLeads()
    console.debug({
      totalSynced: result.fetched,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync leads"
    console.error(message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
