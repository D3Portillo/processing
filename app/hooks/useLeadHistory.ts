"use client"

import useSWR from "swr"

export interface LeadHistoryEntry {
  Id: string
  LeadId: string
  Field: string
  OldValue: string | null
  NewValue: string | null
  CreatedDate: string
}

const fetcher = async (url: string): Promise<LeadHistoryEntry[]> => {
  const res = await fetch(url)
  const data = (await res.json()) as LeadHistoryEntry[] | { error?: string }

  if (!res.ok) {
    throw new Error(
      "error" in data && data.error ? data.error : "Unable to fetch lead history",
    )
  }

  return data as LeadHistoryEntry[]
}

export function useLeadHistory(leadId: string | null) {
  return useSWR(
    leadId ? `/api/leads/${leadId}/history` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10 * 60 * 1000,
      refreshInterval: 10 * 60 * 1000,
    },
  )
}