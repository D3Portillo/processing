import { NextResponse } from "next/server"
import { getLeadMetadata } from "@/app/lib/lead-metadata"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  try {
    const { leadId } = await params
    return NextResponse.json(await getLeadMetadata(leadId))
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch lead metadata"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
