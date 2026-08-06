# TRG Processing

An internal workspace for processing specialists to manage active mortgage files. Designed around the daily workflow of calling lenders, following up with borrowers, tracking sale dates, and moving files through the relief process.

## What It Does

**My Work** — Your starting point. Shows what needs attention right now:
- Overdue tasks
- Tasks due today and tomorrow
- Upcoming sale dates in the next 30 days
- Recently updated files

**Mortgage File** — The workspace for each active file:
- Borrower contact info and loan details
- Assigned specialist and lender
- Current stage (Intake → Document Collection → Lender Review → Negotiation → Approval → Closing)
- Sale date tracking
- Tasks with priorities and due dates
- Notes log
- Activity timeline
- Document list

**All Files** — Browse every file in the system.

## Running Locally

```bash
pnpm install
pnpm dev
```

That's it. The app auto-seeds 50 realistic mortgage files on first load so you can click around immediately. No database setup needed for local dev.

Open http://localhost:3000

## Environment Variables

For production (Vercel + Turso), copy `.env.example` to `.env` and fill in:

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

Local dev doesn't need these — it falls back to a local SQLite file automatically.

## Database Setup & Sync

The app stores tasks, lead metadata, and a lead cache in Turso. Run these once after configuring your environment:

```bash
# Apply the schema and validate the Turso connection.
pnpm setup:db

# Backfill lead metadata (processing start date, welcome call completion)
# from full Salesforce LeadHistory. Run once before relying on the hourly cron.
pnpm sync:metadata

# Sync the Salesforce owner list into data/salesforce-owners.json.
pnpm sync:users
```

Scheduled jobs (Vercel Cron, see `vercel.json`):
- **Daily** (`0 2 * * *`) — `generate-tasks`: creates follow-up tasks based on each lead's status and `Next_Status_Update__c`.
- **Hourly** (`0 * * * *`) — `sync-lead-metadata`: folds recent Salesforce LeadHistory into Turso lead metadata.