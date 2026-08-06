import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { db } from "@/app/lib/db"

// Completes a task and optionally records a "what happened" note.
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

    const now = new Date().toISOString()

    const taskResult = await db.execute({
      sql: `UPDATE tasks SET status = 'Completed', completed_at = ? WHERE id = ? AND status = 'Open'`,
      args: [now, taskId],
    })

    if (Number(taskResult.rowsAffected) === 0) {
      return NextResponse.json({ error: "Task not found or already completed" }, { status: 404 })
    }

    if (note) {
      const fileResult = await db.execute({
        sql: `SELECT file_id FROM tasks WHERE id = ?`,
        args: [taskId],
      })
      const fileId = String(fileResult.rows[0]?.file_id ?? "")

      await db.execute({
        sql: `INSERT INTO task_updates (id, task_id, file_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [randomUUID(), taskId, fileId, authorId, note, now],
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to complete task"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
