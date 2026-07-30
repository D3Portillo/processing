import { drizzle } from "drizzle-orm/libsql";
import { getDb } from "./db";
import * as schema from "./schema";
import type { Stage, TaskPriority } from "./types";

// ─── Seed Data Generator ─────────────────────────────────────
// Generates ~50 realistic mortgage files with all related entities.

const SPECIALISTS = [
  { id: "sp-1", name: "Sarah Chen", email: "sarah.chen@pathwaymortgage.com", avatarColor: "#3b82f6" },
  { id: "sp-2", name: "Marcus Johnson", email: "marcus.johnson@pathwaymortgage.com", avatarColor: "#8b5cf6" },
  { id: "sp-3", name: "Elena Rodriguez", email: "elena.rodriguez@pathwaymortgage.com", avatarColor: "#ec4899" },
  { id: "sp-4", name: "David Park", email: "david.park@pathwaymortgage.com", avatarColor: "#f59e0b" },
  { id: "sp-5", name: "Jessica Williams", email: "jessica.williams@pathwaymortgage.com", avatarColor: "#10b981" },
];

const LENDERS = [
  { id: "ln-1", name: "Wells Fargo Home Mortgage", phone: "1-800-555-0142", email: "lossmit@wellsfargo.com" },
  { id: "ln-2", name: "Bank of America", phone: "1-800-555-0188", email: "home retention@bofa.com" },
  { id: "ln-3", name: "Mr. Cooper (Nationstar)", phone: "1-888-555-0199", email: "lossmit@mrcooper.com" },
  { id: "ln-4", name: "Quicken Loans / Rocket Mortgage", phone: "1-800-555-0123", email: "retention@rocketmortgage.com" },
  { id: "ln-5", name: "U.S. Bank Home Mortgage", phone: "1-800-555-0167", email: "lossmit@usbank.com" },
  { id: "ln-6", name: "CitiMortgage", phone: "1-800-555-0155", email: "lossmit@citi.com" },
  { id: "ln-7", name: "PNC Bank Mortgage", phone: "1-800-555-0173", email: "homeassistance@pnc.com" },
  { id: "ln-8", name: "Freedom Mortgage", phone: "1-888-555-0144", email: "lossmit@freedommortgage.com" },
  { id: "ln-9", name: "Caliber Home Loans", phone: "1-800-555-0166", email: "retention@caliberhomeloans.com" },
  { id: "ln-10", name: "LoanDepot", phone: "1-888-555-0177", email: "lossmit@loandepot.com" },
];

const POC_TITLES = ["Loss Mitigation Specialist", "Home Retention Officer", "Loan Servicing Manager", "Modification Specialist", "Collections Supervisor"];
const POC_FIRST_NAMES = ["Maria", "James", "Patricia", "Robert", "Susan", "Michael", "Linda", "David", "Karen", "Daniel", "Nancy", "Christopher", "Lisa", "Anthony", "Sandra"];
const POC_LAST_NAMES = ["Torres", "Johnson", "Garcia", "Martinez", "Williams", "Brown", "Davis", "Miller", "Wilson", "Anderson", "Thomas", "Lee", "Harris", "Clark", "Lewis"];

const BORROWER_FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph",
  "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy",
  "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
  "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna",
  "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy",
  "George", "Melissa", "Edward", "Deborah",
];

const BORROWER_LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts",
];

const STREETS = [
  "Oak Ave", "Maple Dr", "Cedar Ln", "Pine St", "Elm Way", "Birch Rd", "Walnut Ct",
  "Cherry Blvd", "Spruce Pl", "Willow Cir", "Aspen Dr", "Hickory Ln", "Magnolia St",
  "Sycamore Ave", "Juniper Way", "Poplar Rd", "Chestnut Dr", "Hawthorne Ln",
  "Laurel St", "Dogwood Ct", "Fremont Blvd", "San Mateo Dr", "Veterans Way",
  "Heritage Ln", "Riverside Dr", "Highland Ave", "Park View Ct", "Sunset Blvd",
];

const CITIES = [
  { city: "Santa Ana", state: "CA" },
  { city: "Anaheim", state: "CA" },
  { city: "Long Beach", state: "CA" },
  { city: "Riverside", state: "CA" },
  { city: "Corona", state: "CA" },
  { city: "Garden Grove", state: "CA" },
  { city: "Huntington Beach", state: "CA" },
  { city: "Irvine", state: "CA" },
  { city: "Costa Mesa", state: "CA" },
  { city: "Fullerton", state: "CA" },
];

const STAGES: Stage[] = [
  "Intake", "Document Collection", "Lender Review", "Negotiation",
  "Approval", "Closing", "Completed", "Rejected",
];

const TASK_TITLES = [
  "Call lender for status update",
  "Request payoff statement",
  "Follow up on hardship letter",
  "Send financial worksheet to borrower",
  "Review bank statements",
  "Submit modification package to lender",
  "Call borrower for missing documents",
  "Schedule appraisal",
  "Review title report",
  "Confirm sale date with attorney",
  "Request reinstatement quote",
  "Follow up on trial payment plan",
  "Upload income verification",
  "Call lender to negotiate terms",
  "Send forbearance agreement to borrower",
  "Review NACA submission",
  "Confirm HUD counseling completion",
  "Request loan servicer notes",
  "Prepare denial letter",
  "Submit appeal package",
  "Verify borrower employment",
  "Request updated tax returns",
  "Contact housing counselor",
  "Review escrow analysis",
  "Schedule borrower call",
  "Send welcome packet",
  "Verify insurance coverage",
  "Request property inspection report",
  "Follow up on short sale offer",
  "Confirm deed-in-lieu eligibility",
];

const NOTE_BODIES = [
  "Called lender — they need updated bank statements (last 60 days). Borrower notified.",
  "Borrower confirmed hardship is due to job loss. Severance ends next month.",
  "Lender received the modification package. Assigned to negotiator Maria Torres.",
  "Sale date postponed from Aug 15 to Sep 20. Confirmed with attorney's office.",
  "Borrower struggling to get W-2 from previous employer. Will use last paystub instead.",
  "Trial payment plan approved: $1,850/mo for 3 months. Starting Sep 1.",
  "Lender denied modification — DTI ratio too high. Preparing appeal.",
  "Borrower sent all requested docs via portal. Package is complete.",
  "Spoke with HUD counselor — they'll submit case within 48 hours.",
  "Lender requesting property tax bill. Borrower will upload today.",
  "Escalated to supervisor at lender. Got reference number: LM-2026-4521.",
  "Borrower filed Chapter 13 bankruptcy. Sale date automatically stayed.",
  "Short sale offer received at $385K. Lender reviewing.",
  "Borrower's income increased — got new job. Re-running affordability analysis.",
  "Lender approved forbearance for 6 months. Payments resume Mar 2027.",
  "Called borrower — no answer. Left voicemail. Will try again tomorrow.",
  "Lender says package was incomplete. Missing hardship affidavit. Resubmitting.",
  "Deed-in-lieu approved. Borrower reviewing deed transfer paperwork.",
  "Trial payments completed successfully. Permanent modification under review.",
  "Borrower wants to withdraw. Considering reinstatement instead.",
];

const DOC_TYPES = [
  { name: "Hardship Letter", type: "PDF" },
  { name: "Bank Statements (60 days)", type: "PDF" },
  { name: "W-2 Form 2025", type: "PDF" },
  { name: "Paystubs (30 days)", type: "PDF" },
  { name: "Tax Return 2024", type: "PDF" },
  { name: "Mortgage Statement", type: "PDF" },
  { name: "Property Tax Bill", type: "PDF" },
  { name: "Insurance Declaration", type: "PDF" },
  { name: "Financial Worksheet", type: "XLSX" },
  { name: "Modification Agreement", type: "PDF" },
  { name: "Trial Payment Plan", type: "PDF" },
  { name: "Authorization Form", type: "PDF" },
];

// ─── Helpers ─────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function randomInt(min: number, max: number, rand: () => number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function daysFromNow(days: number, rand?: () => number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const r = rand ?? Math.random;
  d.setHours(randomInt(8, 17, r), randomInt(0, 59, r), 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, rand?: () => number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const r = rand ?? Math.random;
  d.setHours(randomInt(8, 17, r), randomInt(0, 59, r), 0, 0);
  return d.toISOString();
}

function genPhone(rand: () => number): string {
  return `(${randomInt(200, 989, rand)}) ${randomInt(200, 989, rand)}-${randomInt(1000, 9999, rand)}`;
}

function genLoanNumber(rand: () => number): string {
  return `${randomInt(100, 999, rand)}${randomInt(1000000, 9999999, rand)}`;
}

// ─── Main Seed Function ──────────────────────────────────────

export async function seedDatabase() {
  const db = drizzle(getDb(), { schema });

  // Drop and recreate tables (raw SQL for SQLite)
  const client = getDb();
  await client.execute("DROP TABLE IF EXISTS documents");
  await client.execute("DROP TABLE IF EXISTS timeline_events");
  await client.execute("DROP TABLE IF EXISTS notes");
  await client.execute("DROP TABLE IF EXISTS tasks");
  await client.execute("DROP TABLE IF EXISTS mortgage_files");
  await client.execute("DROP TABLE IF EXISTS borrowers");
  await client.execute("DROP TABLE IF EXISTS lender_pocs");
  await client.execute("DROP TABLE IF EXISTS lenders");
  await client.execute("DROP TABLE IF EXISTS specialists");

  // Create tables
  await client.execute(`
    CREATE TABLE specialists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      avatar_color TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE lenders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE lender_pocs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      lender_id TEXT NOT NULL REFERENCES lenders(id)
    )
  `);
  await client.execute(`
    CREATE TABLE borrowers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      property_address TEXT NOT NULL,
      loan_number TEXT NOT NULL,
      monthly_payment INTEGER NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE mortgage_files (
      id TEXT PRIMARY KEY,
      borrower_id TEXT NOT NULL REFERENCES borrowers(id),
      specialist_id TEXT NOT NULL REFERENCES specialists(id),
      lender_id TEXT NOT NULL REFERENCES lenders(id),
      poc_id TEXT,
      stage TEXT NOT NULL,
      sale_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE tasks (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL REFERENCES mortgage_files(id),
      title TEXT NOT NULL,
      description TEXT,
      assigned_to_id TEXT NOT NULL REFERENCES specialists(id),
      due_date TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    )
  `);
  await client.execute(`
    CREATE TABLE notes (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL REFERENCES mortgage_files(id),
      author_id TEXT NOT NULL REFERENCES specialists(id),
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE timeline_events (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL REFERENCES mortgage_files(id),
      type TEXT NOT NULL,
      actor_id TEXT NOT NULL REFERENCES specialists(id),
      description TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL REFERENCES mortgage_files(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      uploaded_by_id TEXT NOT NULL REFERENCES specialists(id),
      file_size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const rand = seededRandom(42);

  // Insert specialists
  for (const sp of SPECIALISTS) {
    await db.insert(schema.specialists).values(sp);
  }

  // Insert lenders
  for (const ln of LENDERS) {
    await db.insert(schema.lenders).values(ln);
  }

  // Insert POCs — 2-3 per lender
  let pocCounter = 0;
  const pocMap: Record<string, string> = {}; // lenderId -> first pocId
  for (const ln of LENDERS) {
    const pocCount = randomInt(2, 3, rand);
    for (let p = 0; p < pocCount; p++) {
      const pocId = `poc-${++pocCounter}`;
      const pocName = `${pick(POC_FIRST_NAMES, rand)} ${pick(POC_LAST_NAMES, rand)}`;
      if (!pocMap[ln.id]) pocMap[ln.id] = pocId;
      await db.insert(schema.lenderPocs).values({
        id: pocId,
        name: pocName,
        title: pick(POC_TITLES, rand),
        phone: genPhone(rand),
        email: `${pocName.toLowerCase().replace(" ", ".")}@${ln.email.split("@")[1]}`,
        lenderId: ln.id,
      });
    }
  }

  // Generate 50 mortgage files
  const FILE_COUNT = 50;
  for (let i = 0; i < FILE_COUNT; i++) {
    const borrowerId = `br-${i + 1}`;
    const fileId = `mf-${i + 1}`;
    const firstName = pick(BORROWER_FIRST_NAMES, rand);
    const lastName = pick(BORROWER_LAST_NAMES, rand);
    const borrowerName = `${firstName} ${lastName}`;
    const city = pick(CITIES, rand);
    const street = `${randomInt(100, 9999, rand)} ${pick(STREETS, rand)}`;
    const specialist = pick(SPECIALISTS, rand);
    const lender = pick(LENDERS, rand);
    const stage = pick(STAGES, rand);
    const createdAt = daysAgo(randomInt(7, 120, rand));
    const updatedAt = daysAgo(randomInt(0, 7, rand));

    // Sale date: 40% have one, some upcoming, some past
    let saleDate: string | null = null;
    const saleRoll = rand();
    if (saleRoll < 0.35) {
      // upcoming sale date (1-45 days out)
      saleDate = daysFromNow(randomInt(1, 45, rand));
    } else if (saleRoll < 0.5) {
      // past sale date (already happened)
      saleDate = daysAgo(randomInt(1, 60, rand));
    }
    // else null — no sale date

    // Insert borrower
    await db.insert(schema.borrowers).values({
      id: borrowerId,
      name: borrowerName,
      phone: genPhone(rand),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      propertyAddress: `${street}, ${city.city}, ${city.state} ${randomInt(90000, 92899, rand)}`,
      loanNumber: genLoanNumber(rand),
      monthlyPayment: randomInt(1200, 4500, rand),
    });

    // Insert mortgage file
    const filePocId = pocMap[lender.id] ?? null;
    await db.insert(schema.mortgageFiles).values({
      id: fileId,
      borrowerId,
      specialistId: specialist.id,
      lenderId: lender.id,
      pocId: filePocId,
      stage,
      saleDate,
      createdAt,
      updatedAt,
    });

    // Timeline: file_created
    await db.insert(schema.timelineEvents).values({
      id: `tl-${i}-0`,
      fileId,
      type: "file_created",
      actorId: specialist.id,
      description: "File created and assigned",
      metadata: JSON.stringify({ specialistId: specialist.id }),
      createdAt,
    });

    // Timeline: file_assigned
    if (rand() > 0.3) {
      await db.insert(schema.timelineEvents).values({
        id: `tl-${i}-1`,
        fileId,
        type: "file_assigned",
        actorId: specialist.id,
        description: `File assigned to ${specialist.name}`,
        metadata: JSON.stringify({ specialistId: specialist.id }),
        createdAt: daysAgo(randomInt(5, 100, rand)),
      });
    }

    // Tasks: 2-6 per file
    const taskCount = randomInt(2, 6, rand);
    for (let t = 0; t < taskCount; t++) {
      const taskId = `tk-${i}-${t}`;
      const taskTitle = pick(TASK_TITLES, rand);
      const taskSpecialist = pick(SPECIALISTS, rand);
      const priority = pick(["High", "Medium", "Low"] as TaskPriority[], rand);
      const isCompleted = rand() < 0.35;
      const taskCreatedAt = daysAgo(randomInt(1, 30, rand));

      // Due dates: some overdue, some today, some tomorrow, some future
      let dueDate: string | null = null;
      const dueRoll = rand();
      if (dueRoll < 0.2) {
        dueDate = daysAgo(randomInt(1, 14, rand)); // overdue
      } else if (dueRoll < 0.35) {
        dueDate = daysFromNow(0); // today
      } else if (dueRoll < 0.5) {
        dueDate = daysFromNow(1); // tomorrow
      } else if (dueRoll < 0.8) {
        dueDate = daysFromNow(randomInt(2, 21, rand)); // upcoming
      }
      // else null — no due date

      await db.insert(schema.tasks).values({
        id: taskId,
        fileId,
        title: taskTitle,
        description: null,
        assignedToId: taskSpecialist.id,
        dueDate,
        priority,
        status: isCompleted ? "Completed" : "Open",
        createdAt: taskCreatedAt,
        completedAt: isCompleted ? daysAgo(randomInt(0, 5, rand)) : null,
      });

      // Timeline for completed tasks
      if (isCompleted) {
        await db.insert(schema.timelineEvents).values({
          id: `tl-${i}-task-${t}`,
          fileId,
          type: "task_completed",
          actorId: taskSpecialist.id,
          description: `Task completed: ${taskTitle}`,
          metadata: JSON.stringify({ taskId }),
          createdAt: daysAgo(randomInt(0, 5, rand)),
        });
      } else {
        await db.insert(schema.timelineEvents).values({
          id: `tl-${i}-task-${t}`,
          fileId,
          type: "task_created",
          actorId: taskSpecialist.id,
          description: `Task created: ${taskTitle}`,
          metadata: JSON.stringify({ taskId }),
          createdAt: taskCreatedAt,
        });
      }
    }

    // Notes: 1-4 per file
    const noteCount = randomInt(1, 4, rand);
    for (let n = 0; n < noteCount; n++) {
      const noteId = `nt-${i}-${n}`;
      const noteAuthor = pick(SPECIALISTS, rand);
      const noteBody = pick(NOTE_BODIES, rand);
      const noteCreatedAt = daysAgo(randomInt(0, 60, rand));

      await db.insert(schema.notes).values({
        id: noteId,
        fileId,
        authorId: noteAuthor.id,
        body: noteBody,
        createdAt: noteCreatedAt,
      });

      await db.insert(schema.timelineEvents).values({
        id: `tl-${i}-note-${n}`,
        fileId,
        type: "note_added",
        actorId: noteAuthor.id,
        description: "Note added",
        metadata: null,
        createdAt: noteCreatedAt,
      });
    }

    // Documents: 1-4 per file
    const docCount = randomInt(1, 4, rand);
    for (let d = 0; d < docCount; d++) {
      const docId = `dc-${i}-${d}`;
      const doc = pick(DOC_TYPES, rand);
      const uploader = pick(SPECIALISTS, rand);
      const docCreatedAt = daysAgo(randomInt(0, 60, rand));

      await db.insert(schema.documents).values({
        id: docId,
        fileId,
        name: doc.name,
        type: doc.type,
        uploadedById: uploader.id,
        fileSize: randomInt(50000, 5000000, rand),
        createdAt: docCreatedAt,
      });

      await db.insert(schema.timelineEvents).values({
        id: `tl-${i}-doc-${d}`,
        fileId,
        type: "document_uploaded",
        actorId: uploader.id,
        description: `Document uploaded: ${doc.name}`,
        metadata: JSON.stringify({ docId }),
        createdAt: docCreatedAt,
      });
    }

    // Stage change timeline events (1-3)
    const stageChangeCount = randomInt(0, 3, rand);
    for (let s = 0; s < stageChangeCount; s++) {
      const prevStage = pick(STAGES, rand);
      await db.insert(schema.timelineEvents).values({
        id: `tl-${i}-stage-${s}`,
        fileId,
        type: "stage_changed",
        actorId: specialist.id,
        description: `Stage changed from ${prevStage} to ${stage}`,
        metadata: JSON.stringify({ from: prevStage, to: stage }),
        createdAt: daysAgo(randomInt(1, 80, rand)),
      });
    }
  }

  console.log(`Seed complete: ${FILE_COUNT} mortgage files`);
}