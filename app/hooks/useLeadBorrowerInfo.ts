"use client"

import useSWRImmutable from "swr/immutable"
import { jsonify } from "@/app/lib/utils"
import type { LeadBorrowerInfo } from "@/app/api/leads/[leadId]/borrower-info/route"

const fetcher = (url: string) => jsonify<LeadBorrowerInfo | null>(fetch(url))

export function useLeadBorrowerInfo(leadId?: string | null) {
  const url = leadId
    ? `/api/leads/${encodeURIComponent(leadId)}/borrower-info`
    : null

  return useSWRImmutable<LeadBorrowerInfo | null>(url, fetcher)
}
