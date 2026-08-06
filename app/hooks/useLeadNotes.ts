"use client"

import useSWRImmutable from "swr/immutable"
import type { SalesforceLeadNote } from "@/app/lib/types"
import { jsonify } from "@/app/lib/utils"

const fetcher = (url: string) => jsonify<SalesforceLeadNote[]>(fetch(url))

export function useLeadNotes(leadId?: string | null) {
  const url = leadId
    ? `/api/leads/${encodeURIComponent(leadId)}/notes`
    : null

  return useSWRImmutable<SalesforceLeadNote[]>(url, fetcher)
}