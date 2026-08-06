import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { db } from "@/app/lib/db"

// Completes a task and records the required completion notes.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  const { taskId } = await params

  try {
    const body = (await request.json().catch(() => ({}))) as {
      note?: string
      authorId?: string
    }
    const note = body.note?.trim() || null
    const authorId = body.authorId ?? ""

    if (!note) {
      return NextResponse.json(
        { error: "Notes are required to complete this task" },
        { status: 400 },
      )
    }

    const taskResult = await db.execute({
      sql: `SELECT file_id, assigned_to, type, status FROM tasks WHERE id = ?`,
      args: [taskId],
    })
    const task = taskResult.rows[0]

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (String(task.status) !== "Open") {
      return NextResponse.json(
        { error: "Task not found or already completed" },
        { status: 404 },
      )
    }

    if (
      String(task.type) === "internal_red_flag" &&
      String(task.assigned_to) !== authorId
    ) {
      return NextResponse.json(
        { error: "Only assigned person can close this task" },
        { status: 403 },
      )
    }

    const now = new Date().toISOString()

    const updateResult = await db.execute({
      sql: `UPDATE tasks SET status = 'Completed', completed_at = ? WHERE id = ? AND status = 'Open'`,
      args: [now, taskId],
    })

    if (Number(updateResult.rowsAffected) === 0) {
      return NextResponse.json({ error: "Task not found or already completed" }, { status: 404 })
    }

    const fileId = String(task.file_id ?? "")

    await db.execute({
      sql: `INSERT INTO task_updates (id, task_id, file_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), taskId, fileId, authorId, note, now],
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete task"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
