"use client"

import { useCallback, useMemo, useState } from "react"
import useSWRImmutable from "swr/immutable"
import type { SalesforceLead } from "@/app/lib/sf-leads"

const LEADS_CACHE_KEY = "processing:leads:v4"
const LEADS_CACHE_TTL = 10 * 60 * 1000
const LEADS_PAGE_SIZE = 100

type CachedLeads = {
  cachedAt: number
  leads: SalesforceLead[]
}

const fetcher = async (): Promise<SalesforceLead[]> => {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LEADS_CACHE_KEY)

      if (cached) {
        const parsed = JSON.parse(cached) as CachedLeads

        if (
          Array.isArray(parsed.leads) &&
          Date.now() - parsed.cachedAt < LEADS_CACHE_TTL
        ) {
          return parsed.leads
        }
      }
    } catch {
      localStorage.removeItem(LEADS_CACHE_KEY)
    }
  }

  const res = await fetch("/api/leads")
  const data = (await res.json()) as SalesforceLead[] | { error?: string }

  if (!res.ok) {
    throw new Error(
      "error" in data && data.error ? data.error : "Unable to fetch leads",
    )
  }

  const leads = data as SalesforceLead[]

  if (typeof window !== "undefined" && leads.length > 0) {
    try {
      localStorage.setItem(
        LEADS_CACHE_KEY,
        JSON.stringify({ cachedAt: Date.now(), leads } satisfies CachedLeads),
      )
    } catch {
      // Continue with the fresh response if localStorage is unavailable.
    }
  }

  return leads
}

export function useLeads() {
  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable<
    SalesforceLead[]
  >(`all-leads-v2`, fetcher)

  const [visibleCount, setVisibleCount] = useState(LEADS_PAGE_SIZE)
  const leads = useMemo(
    () => (data ?? []).slice(0, visibleCount),
    [data, visibleCount],
  )

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + LEADS_PAGE_SIZE)
  }, [])

  return {
    data,
    totalLeads: data?.length || 0,
    error,
    isLoading,
    isValidating,
    mutate,
    leads,
    hasMore: visibleCount < (data?.length ?? 0),
    loadMore,
  }
}
