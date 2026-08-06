"use client"

import useSWRImmutable from "swr/immutable"
import type { LeadMetadata } from "@/app/lib/lead-metadata"

type MetadataResponse = LeadMetadata | null | { error?: string }

const fetcher = async (url: string): Promise<LeadMetadata | null> => {
  const res = await fetch(url)
  const data = (await res.json()) as MetadataResponse
  const errorMessage = data && "error" in data ? data.error : undefined

  if (!res.ok) {
    throw new Error(errorMessage ?? "Unable to fetch lead metadata")
  }

  return data as LeadMetadata | null
}

export function useLeadMetadata(leadId?: string | null) {
  const url = leadId
    ? `/api/leads/${encodeURIComponent(leadId)}/metadata`
    : null

  return useSWRImmutable<LeadMetadata | null>(url, fetcher)
}
