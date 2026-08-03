import { NextResponse } from "next/server"
import { getToken, sfQuery } from "@/app/lib/sf"
import type { SalesforceLeadHistory } from "@/app/lib/sf-leads"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params

  if (!leadId) {
    return NextResponse.json({ error: "Missing leadId" }, { status: 400 })
  }

  try {
    const token = await getToken()
    const soql = `SELECT Id, LeadId, Field, OldValue, NewValue, CreatedDate
FROM LeadHistory
WHERE LeadId = '${leadId}'
ORDER BY CreatedDate DESC`

    const history = await sfQuery<SalesforceLeadHistory>(soql, token)
    return NextResponse.json(history)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch lead history"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}