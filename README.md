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