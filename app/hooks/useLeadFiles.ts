"use client"

import useSWRImmutable from "swr/immutable"
import type { SalesforceLeadFile } from "@/app/lib/types"
import { jsonify } from "@/app/lib/utils"

const fetcher = (url: string) => jsonify<SalesforceLeadFile[]>(fetch(url))

export function useLeadFiles(leadId?: string | null) {
  const url = leadId
    ? `/api/leads/${encodeURIComponent(leadId)}/files`
    : null

  return useSWRImmutable<SalesforceLeadFile[]>(url, fetcher)
}