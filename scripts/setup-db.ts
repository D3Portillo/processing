import "dotenv/config"
import { db, SCHEMA } from "../app/lib/db"

// One-time setup: creates the Turso schema and validates the DB connection.
async function main() {
  const url = process.env.TURSO_DATABASE_URL
  const token = process.env.TURSO_AUTH_TOKEN

  if (!url) {
    console.error("Missing TURSO_DATABASE_URL — set it in your environment.")
    process.exitCode = 1
    return
  }
  if (!token) {
    console.error("Missing TURSO_AUTH_TOKEN — set it in your environment.")
    process.exitCode = 1
    return
  }

  console.log(`Applying schema to ${url}...`)
  await db.executeMultiple(SCHEMA)

  // Validate the connection by running a trivial query.
  const result = await db.execute(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  const tables = result.rows.map((row) => String(row.name))
  console.log(`Schema applied. Tables: ${tables.join(", ")}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
