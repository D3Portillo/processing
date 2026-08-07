"use server"

import { randomUUID } from "node:crypto"
import { db } from "@/app/lib/db"
import { todayInTz } from "@/app/lib/dates"
import type { TaskType } from "@/app/lib/task-types"

interface CreateTaskInput {
  fileId: string
  title: string
  type: TaskType
  assignedToId: string
  dueDate: string | null
  note: string | null
}

// Creates a custom task for a file. Returns { error } on validation failure,
// otherwise { ok: true }.
export async function createTask(input: CreateTaskInput) {
  const { fileId, title, type, assignedToId, dueDate, note } = input

  if (!title.trim()) {
    return { error: "Title is required" }
  }
  if (!assignedToId) {
    return { error: "Please select who to assign this task to" }
  }
  if (dueDate && dueDate < todayInTz()) {
    return { error: "Due date cannot be in the past" }
  }

  await db.execute({
    sql: `INSERT INTO tasks
      (id, file_id, title, type, assigned_to, due_date, status, note, idempotency_key, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?, NULL)`,
    args: [
      randomUUID(),
      fileId,
      title.trim(),
      type,
      assignedToId,
      dueDate,
      note,
      randomUUID(),
      new Date().toISOString(),
    ],
  })

  return { ok: true }
}
