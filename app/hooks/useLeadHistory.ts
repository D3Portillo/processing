"use client"

import useSWRImmutable from "swr/immutable"
import type { SalesforceLeadHistory } from "@/app/lib/lead-metadata"

const fetcher = async (url: string): Promise<SalesforceLeadHistory[]> => {
  const res = await fetch(url)
  const data = (await res.json()) as
    | SalesforceLeadHistory[]
    | { error?: string }

  if (!res.ok) {
    throw new Error(
      "error" in data && data.error
        ? data.error
        : "Unable to fetch lead history",
    )
  }

  return data as SalesforceLeadHistory[]
}

export function useLeadHistory(leadId?: string | null) {
  const url = leadId
    ? `/api/leads/${encodeURIComponent(leadId)}/history`
    : null

  return useSWRImmutable<SalesforceLeadHistory[]>(url, fetcher)
}
