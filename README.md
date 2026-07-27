# Pathway Mortgage Operations Portal

An opinionated operations workspace for mortgage relief specialists. Optimized for answering **"What should I work on next?"** — not for being another CRM.

## Stack

- **Next.js 16** (App Router, webpack dev)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** components (Radix primitives)
- **Drizzle ORM** + **Turso** (libsql)
- **Vercel** (deployment target)

## Getting Started

```bash
npm install
npm run dev
```

The app auto-seeds a local SQLite database on first load (no Turso config needed for development). 50 realistic mortgage files are generated with specialists, lenders, tasks, notes, timeline events, and documents.

### Turso (Production)

Set these environment variables to use Turso instead of local SQLite:

```
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token
```

## Architecture

```
UI (Server Components + Client Components)
        ↓
MortgageFileRepository (interface)
        ↓
TursoRepository (implementation)
        ↓
Drizzle ORM → Turso / libsql
```

### Repository Pattern

The UI never touches the database directly. All data access flows through `MortgageFileRepository` — a typed interface defined in `app/lib/repository.ts`.

The current implementation (`TursoRepository` in `app/lib/turso-repository.ts`) uses Drizzle ORM over Turso/libsql. The repository is instantiated as a singleton in `app/lib/repo-instance.ts`.

**To swap implementations**, change one line in `repo-instance.ts`:

```ts
// Today
_repo = new TursoRepository();

// Future
_repo = new SalesforceRepository();
```

### Domain Model

Domain types live in `app/lib/types.ts`. These are the business entities the UI works with — they are decoupled from the database schema.

**Core entity: MortgageFile**
- Borrower (name, phone, email, property address, loan number)
- Assigned Specialist
- Lender
- Current Stage (Intake → Document Collection → Lender Review → Negotiation → Approval → Closing → Completed/Rejected)
- Sale Date
- Timeline (chronological activity history)
- Tasks (with priority, due dates, assignment, completion)
- Notes (chronological, authored by specialists)
- Documents (uploaded with metadata)

### Database Schema

Drizzle schema in `app/lib/schema.ts`. Tables:
- `specialists`
- `lenders`
- `borrowers`
- `mortgage_files`
- `tasks`
- `notes`
- `timeline_events`
- `documents`

### Seed Data

`app/lib/seed.ts` generates realistic data:
- 5 specialists
- 10 lenders (real mortgage servicers)
- 50 mortgage files with randomized borrowers, stages, sale dates
- 2-6 tasks per file (mix of open/completed, overdue/today/tomorrow/upcoming)
- 1-4 notes per file
- 1-4 documents per file
- Timeline events for every action

### Server Actions

Mutations use Next.js Server Actions (`app/lib/actions.ts`):
- `createTaskAction` — create a task on a file
- `completeTaskAction` — mark a task as complete
- `addNoteAction` — add a note to a file
- `updateStageAction` — change a file's stage
- `seedDatabaseAction` — re-seed the database

Each action calls the repository and writes a timeline event automatically.

## Screens

### My Work (Dashboard)
- **Overdue Tasks** — tasks past their due date
- **Due Today** — tasks due today
- **Due Tomorrow** — tasks due tomorrow
- **Upcoming Sale Dates** — next 30 days
- **Recently Updated Files** — most recently touched files

### Mortgage File Detail
- **Header** — borrower, specialist, lender, stage selector, sale date
- **Tasks tab** — open tasks with complete buttons, completed tasks
- **Timeline tab** — chronological activity feed
- **Notes tab** — chronological notes with inline add form
- **Documents tab** — uploaded documents with metadata

### All Files
Simple browse view of all 50 mortgage files.

## Extension Points

### Salesforce Integration

The repository interface is designed so a `SalesforceRepository` can replace `TursoRepository` without UI changes.

**What you'd need to implement:**

1. Create `app/lib/salesforce-repository.ts` implementing `MortgageFileRepository`
2. Use JSforce or Salesforce REST API to map Salesforce objects to domain types
3. Swap the implementation in `repo-instance.ts`

**Likely Salesforce object mapping:**

| Domain Entity | Salesforce Object |
|---|---|
| MortgageFile | Case (or custom `Mortgage_File__c`) |
| Borrower | Contact / Account |
| Specialist | User |
| Lender | Account (record type: Lender) |
| Task | Task (standard) |
| Note | ContentNote / FeedItem |
| Timeline | Case History / custom events |
| Document | ContentDocument / Attachment |

**Key consideration:** Salesforce may not support all timeline event types natively. Custom objects or FeedItem posts may be needed for events like "stage_changed" and "document_uploaded".

## Project Structure

```
app/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, card, badge, dialog, tabs, etc.)
│   ├── FileCard.tsx     # File card, task row, sale date card
│   ├── StageBadge.tsx   # Stage → colored badge
│   ├── StageSelector.tsx # Inline stage dropdown
│   ├── TimelineItem.tsx # Timeline event with icon + actor
│   ├── AddTaskDialog.tsx # Dialog form for creating tasks
│   ├── AddNoteForm.tsx  # Inline form for adding notes
│   └── CompleteTaskButton.tsx # Checkmark toggle for tasks
├── lib/
│   ├── types.ts         # Domain model
│   ├── schema.ts        # Drizzle schema
│   ├── db.ts            # Database client (Turso or local SQLite)
│   ├── repository.ts    # Repository interface
│   ├── turso-repository.ts # Turso/libsql implementation
│   ├── repo-instance.ts # Singleton factory
│   ├── seed.ts          # Seed data generator
│   ├── actions.ts       # Server Actions
│   └── utils.ts         # Date formatting, cn(), helpers
├── files/
│   ├── page.tsx         # All files browse
│   └── [fileId]/
│       └── page.tsx     # File detail (workspace)
├── page.tsx             # My Work dashboard
├── layout.tsx           # Root layout
└── globals.css          # Tailwind v4 + theme tokens
```

## License

Internal — Pathway Mortgage Relief.