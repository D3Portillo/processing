import { NextResponse } from "next/server"
import { getActiveLeads } from "@/app/lib/sf-leads"

export async function GET() {
  try {
    const leads = await getActiveLeads()
    console.debug(`Total Leads: ${leads.length}`)
    return NextResponse.json(leads)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to fetch Salesforce leads"
    console.error(message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
