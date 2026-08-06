import { NextResponse } from "next/server"
import { db, type TaskRow } from "@/app/lib/db"

// Returns tasks for a file (or all tasks when no fileId is provided).
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    const rows = fileId
      ? await db.execute({
          sql: `SELECT * FROM tasks WHERE file_id = ? ORDER BY due_date ASC`,
          args: [fileId],
        })
      : await db.execute(`SELECT * FROM tasks ORDER BY due_date ASC`)

    const tasks = rows.rows as unknown as TaskRow[]
    return NextResponse.json(tasks)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch tasks"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
