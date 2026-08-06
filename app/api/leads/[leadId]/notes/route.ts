import { NextResponse } from "next/server"
import { getToken, isSalesforceId, sfQuery } from "@/app/lib/sf"
import type { SalesforceLeadNote } from "@/app/lib/types"

interface SalesforceFeedItem {
  Id: string
  Title: string | null
  Body: string | null
  CreatedDate: string
  LastModifiedDate: string
  Type: string | null
  CreatedBy?: { Name?: string | null } | null
}

function noteDate(note: SalesforceLeadNote): number {
  return new Date(note.updatedAt || note.createdAt).getTime()
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const { leadId } = await params

  if (!isSalesforceId(leadId)) {
    return NextResponse.json({ error: "A valid Lead ID is required" }, { status: 400 })
  }

  try {
    const token = await getToken()
    const feedItems = await sfQuery<SalesforceFeedItem>(
        `SELECT Id, Title, Body, CreatedDate, LastModifiedDate, Type, CreatedBy.Name
FROM FeedItem
WHERE ParentId = '${leadId}'
ORDER BY LastModifiedDate DESC`,
        token,
      )

    const notes: SalesforceLeadNote[] = feedItems.map((item) => ({
      id: item.Id,
      title: item.Title?.trim() || "Chatter post",
      body: item.Body ?? "",
      authorName: item.CreatedBy?.Name ?? null,
      type: item.Type,
      createdAt: item.CreatedDate,
      updatedAt: item.LastModifiedDate,
    })).sort((left, right) => noteDate(right) - noteDate(left))

    return NextResponse.json(notes)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch lead notes"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}