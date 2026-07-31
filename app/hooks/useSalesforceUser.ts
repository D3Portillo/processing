"use client"

import useSWR from "swr"
import type { GoogleIdentity } from "@/app/lib/google-auth"

const fetcher = async (
  url: string,
): Promise<{ user: GoogleIdentity | null }> => {
  const response = await fetch(url)
  const data = (await response.json()) as { user: GoogleIdentity | null }

  if (!response.ok && response.status !== 401) {
    throw new Error("Unable to load authenticated user")
  }

  return data
}

export function useSalesforceUser() {
  return useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
  })
}
