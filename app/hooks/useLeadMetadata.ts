"use client"

import useSWRImmutable from "swr/immutable"
import type { LeadMetadata } from "@/app/lib/lead-metadata"
import { jsonify } from "@/app/lib/utils"

const fetcher = (url: string) => jsonify<LeadMetadata | null>(fetch(url))

export function useLeadMetadata(leadId?: string | null) {
  const url = leadId
    ? `/api/leads/${encodeURIComponent(leadId)}/metadata`
    : null

  return useSWRImmutable<LeadMetadata | null>(url, fetcher)
}
