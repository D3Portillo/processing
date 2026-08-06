"use client"

import useSWR from "swr"
import type { TaskRow } from "@/app/lib/task-types"
import { jsonify } from "@/app/lib/utils"

const fetcher = (url: string) => jsonify<TaskRow[]>(fetch(url))

export function useTasks(fileId?: string | null) {
  const url = fileId
    ? `/api/tasks?fileId=${encodeURIComponent(fileId)}`
    : "/api/tasks" // Fetch all
  return useSWR<TaskRow[]>(url, fetcher)
}
