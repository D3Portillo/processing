"use client"

import useSWR from "swr"
import type { TaskRow } from "@/app/lib/task-types"

const fetcher = async (url: string): Promise<TaskRow[]> => {
  const res = await fetch(url)
  const data = (await res.json()) as TaskRow[] | { error?: string }

  if (!res.ok) {
    throw new Error(
      "error" in data && data.error ? data.error : "Unable to fetch tasks",
    )
  }

  return data as TaskRow[]
}

export function useTasks(fileId?: string | null) {
  const url = fileId
    ? `/api/tasks?fileId=${encodeURIComponent(fileId)}`
    : "/api/tasks" // Fetch all
  return useSWR<TaskRow[]>(url, fetcher)
}
