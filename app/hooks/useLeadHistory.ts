"use client"

import useSWRImmutable from "swr/immutable"
import type { SalesforceLeadHistory } from "@/app/lib/lead-metadata"
import { jsonify } from "@/app/lib/utils"

const fetcher = (url: string) => jsonify<SalesforceLeadHistory[]>(fetch(url))

export function useLeadHistory(leadId?: string | null) {
  const url = leadId ? `/api/leads/${encodeURIComponent(leadId)}/history` : null

  return useSWRImmutable<SalesforceLeadHistory[]>(url, fetcher)
}
