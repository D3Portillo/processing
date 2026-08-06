import { createClient } from "@libsql/client"

// Turso is the durable store for tasks, completions, and follow-up notes.
// Salesforce remains read-only; all writes go here.
//
// NOTE: Next.js inlines process.env.* at build time. If TURSO_DATABASE_URL is
// not present when the server bundle is built, it becomes `undefined` here
// even if it's set in the runtime shell. Read it lazily and validate so the
// failure is clear instead of a cryptic URL_INVALID error.
function getTursoConfig() {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is not set. Add it to .env and ensure it's present at build time (Next.js inlines env vars at build).",
    )
  }

  return { url, authToken }
}

export const db = createClient(getTursoConfig())

// Shared types live in task-types.ts (no DB client dependency) so they can be
// imported from client components. Re-exported here for convenience.
export {
  TASK_TYPES,
  type TaskType,
  type TaskRow,
  type TaskUpdateRow,
} from "./task-types"

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  note TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_file ON tasks(file_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);

CREATE TABLE IF NOT EXISTS task_updates (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_updates_task ON task_updates(task_id);
CREATE INDEX IF NOT EXISTS idx_task_updates_file ON task_updates(file_id);

`
