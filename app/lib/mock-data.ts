import { useState, useEffect, useSyncExternalStore } from "react";
import type {
  MortgageFile,
  MortgageFileDetail,
  Task,
  Note,
  TimelineEvent,
  DocumentRecord,
  Specialist,
  Lender,
  LenderContact,
  Stage,
  TaskPriority,
} from "./types";

// ─── Client-side Mock Store ──────────────────────────────────
// Singleton in-memory state. Mutations notify React via useSyncExternalStore.
// This is throwaway UI prototype state — replace with Salesforce later.

// ─── Static Data ─────────────────────────────────────────────

const SPECIALISTS: Specialist[] = [
  { id: "sp-1", name: "Sarah Chen", email: "sarah.chen@trgprocessing.com", avatarColor: "#3b82f6" },
  { id: "sp-2", name: "Marcus Johnson", email: "marcus.johnson@trgprocessing.com", avatarColor: "#8b5cf6" },
  { id: "sp-3", name: "Elena Rodriguez", email: "elena.rodriguez@trgprocessing.com", avatarColor: "#ec4899" },
  { id: "sp-4", name: "David Park", email: "david.park@trgprocessing.com", avatarColor: "#f59e0b" },
  { id: "sp-5", name: "Jessica Williams", email: "jessica.williams@trgprocessing.com", avatarColor: "#10b981" },
];

const LENDERS: Lender[] = [
  { id: "ln-1", name: "Wells Fargo Home Mortgage", phone: "1-800-555-0142", email: "lossmit@wellsfargo.com" },
  { id: "ln-2", name: "Bank of America", phone: "1-800-555-0188", email: "homeretention@bofa.com" },
  { id: "ln-3", name: "Mr. Cooper (Nationstar)", phone: "1-888-555-0199", email: "lossmit@mrcooper.com" },
  { id: "ln-4", name: "Quicken Loans / Rocket Mortgage", phone: "1-800-555-0123", email: "retention@rocketmortgage.com" },
  { id: "ln-5", name: "U.S. Bank Home Mortgage", phone: "1-800-555-0167", email: "lossmit@usbank.com" },
  { id: "ln-6", name: "CitiMortgage", phone: "1-800-555-0155", email: "lossmit@citi.com" },
  { id: "ln-7", name: "PNC Bank Mortgage", phone: "1-800-555-0173", email: "homeassistance@pnc.com" },
  { id: "ln-8", name: "Freedom Mortgage", phone: "1-888-555-0144", email: "lossmit@freedommortgage.com" },
  { id: "ln-9", name: "Caliber Home Loans", phone: "1-800-555-0166", email: "retention@caliberhomeloans.com" },
  { id: "ln-10", name: "LoanDepot", phone: "1-888-555-0177", email: "lossmit@loandepot.com" },
];

const LENDER_DEPARTMENTS = ["Loss Mitigation", "Home Retention", "Loan Servicing", "Modification Department", "Collections"];

const POC_FIRST_NAMES = ["Maria", "James", "Patricia", "Robert", "Susan", "Michael", "Linda", "David", "Karen", "Daniel", "Nancy", "Christopher", "Lisa", "Anthony", "Sandra"];
const POC_LAST_NAMES = ["Torres", "Johnson", "Garcia", "Martinez", "Williams", "Brown", "Davis", "Miller", "Wilson", "Anderson", "Thomas", "Lee", "Harris", "Clark", "Lewis"];

const BORROWER_FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa", "Edward", "Deborah"];
const BORROWER_LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

const STREETS = ["Oak Ave", "Maple Dr", "Cedar Ln", "Pine St", "Elm Way", "Birch Rd", "Walnut Ct", "Cherry Blvd", "Spruce Pl", "Willow Cir", "Aspen Dr", "Hickory Ln", "Magnolia St", "Sycamore Ave", "Juniper Way", "Poplar Rd", "Chestnut Dr", "Hawthorne Ln", "Laurel St", "Dogwood Ct", "Fremont Blvd", "San Mateo Dr", "Veterans Way", "Heritage Ln", "Riverside Dr", "Highland Ave", "Park View Ct", "Sunset Blvd"];
const CITIES = [{ city: "Santa Ana", state: "CA" }, { city: "Anaheim", state: "CA" }, { city: "Long Beach", state: "CA" }, { city: "Riverside", state: "CA" }, { city: "Corona", state: "CA" }, { city: "Garden Grove", state: "CA" }, { city: "Huntington Beach", state: "CA" }, { city: "Irvine", state: "CA" }, { city: "Costa Mesa", state: "CA" }, { city: "Fullerton", state: "CA" }];

const STAGES: Stage[] = ["Intake", "Document Collection", "Lender Review", "Negotiation", "Approval", "Closing", "Completed", "Rejected"];

const TASK_TITLES = ["Call lender for status update", "Request payoff statement", "Follow up on hardship letter", "Send financial worksheet to borrower", "Review bank statements", "Submit modification package to lender", "Call borrower for missing documents", "Schedule appraisal", "Review title report", "Confirm sale date with attorney", "Request reinstatement quote", "Follow up on trial payment plan", "Upload income verification", "Call lender to negotiate terms", "Send forbearance agreement to borrower", "Review NACA submission", "Confirm HUD counseling completion", "Request loan servicer notes", "Prepare denial letter", "Submit appeal package", "Verify borrower employment", "Request updated tax returns", "Contact housing counselor", "Review escrow analysis", "Schedule borrower call", "Send welcome packet", "Verify insurance coverage", "Request property inspection report", "Follow up on short sale offer", "Confirm deed-in-lieu eligibility"];

const NOTE_BODIES = ["Called lender — they need updated bank statements (last 60 days). Borrower notified.", "Borrower confirmed hardship is due to job loss. Severance ends next month.", "Lender received the modification package. Assigned to negotiator Maria Torres.", "Sale date postponed from Aug 15 to Sep 20. Confirmed with attorney's office.", "Borrower struggling to get W-2 from previous employer. Will use last paystub instead.", "Trial payment plan approved: $1,850/mo for 3 months. Starting Sep 1.", "Lender denied modification — DTI ratio too high. Preparing appeal.", "Borrower sent all requested docs via portal. Package is complete.", "Spoke with HUD counselor — they'll submit case within 48 hours.", "Lender requesting property tax bill. Borrower will upload today.", "Escalated to supervisor at lender. Got reference number: LM-2026-4521.", "Borrower filed Chapter 13 bankruptcy. Sale date automatically stayed.", "Short sale offer received at $385K. Lender reviewing.", "Borrower's income increased — got new job. Re-running affordability analysis.", "Lender approved forbearance for 6 months. Payments resume Mar 2027.", "Called borrower — no answer. Left voicemail. Will try again tomorrow.", "Lender says package was incomplete. Missing hardship affidavit. Resubmitting.", "Deed-in-lieu approved. Borrower reviewing deed transfer paperwork.", "Trial payments completed successfully. Permanent modification under review.", "Borrower wants to withdraw. Considering reinstatement instead."];

const DOC_TYPES = [{ name: "Hardship Letter", type: "PDF" }, { name: "Bank Statements (60 days)", type: "PDF" }, { name: "W-2 Form 2025", type: "PDF" }, { name: "Paystubs (30 days)", type: "PDF" }, { name: "Tax Return 2024", type: "PDF" }, { name: "Mortgage Statement", type: "PDF" }, { name: "Property Tax Bill", type: "PDF" }, { name: "Insurance Declaration", type: "PDF" }, { name: "Financial Worksheet", type: "XLSX" }, { name: "Modification Agreement", type: "PDF" }, { name: "Trial Payment Plan", type: "PDF" }, { name: "Authorization Form", type: "PDF" }];

// ─── RNG ─────────────────────────────────────────────────────

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function pick<T>(arr: T[], rand: () => number): T { return arr[Math.floor(rand() * arr.length)]; }
function randomInt(min: number, max: number, rand: () => number): number { return Math.floor(rand() * (max - min + 1)) + min; }
function daysFromNow(days: number, rand?: () => number): string { const d = new Date(); d.setDate(d.getDate() + days); const r = rand ?? Math.random; d.setHours(randomInt(8, 17, r), randomInt(0, 59, r), 0, 0); return d.toISOString(); }
function daysAgo(days: number, rand?: () => number): string { const d = new Date(); d.setDate(d.getDate() - days); const r = rand ?? Math.random; d.setHours(randomInt(8, 17, r), randomInt(0, 59, r), 0, 0); return d.toISOString(); }
function genPhone(rand: () => number): string { return `(${randomInt(200, 989, rand)}) ${randomInt(200, 989, rand)}-${randomInt(1000, 9999, rand)}`; }
function genLoanNumber(rand: () => number): string { return `${randomInt(100, 999, rand)}${randomInt(1000000, 9999999, rand)}`; }

// ─── Store ───────────────────────────────────────────────────

type Store = {
  specialists: Specialist[];
  lenders: Lender[];
  contacts: LenderContact[];
  files: MortgageFile[];
  tasks: Task[];
  notes: Note[];
  timeline: TimelineEvent[];
  documents: DocumentRecord[];
};

let store: Store | null = null;
const listeners = new Set<() => void>();

function getStore(): Store {
  if (store) return store;

  const s = seededRandom(42);
  const contacts: LenderContact[] = [];
  const files: MortgageFile[] = [];
  const tasks: Task[] = [];
  const notes: Note[] = [];
  const timeline: TimelineEvent[] = [];
  const documents: DocumentRecord[] = [];
  const contactByLender: Record<string, string> = {};

  // Contacts
  let cc = 0;
  for (const ln of LENDERS) {
    const count = randomInt(1, 2, s);
    for (let c = 0; c < count; c++) {
      const cid = `lc-${++cc}`;
      const dept = pick(LENDER_DEPARTMENTS, s);
      const name = s() < 0.6 ? `${pick(POC_FIRST_NAMES, s)} ${pick(POC_LAST_NAMES, s)}` : null;
      if (!contactByLender[ln.id]) contactByLender[ln.id] = cid;
      contacts.push({ id: cid, department: dept, name, phone: genPhone(s), email: `${dept.toLowerCase().replace(/ /g, ".")}@${ln.email.split("@")[1]}`, lenderId: ln.id });
    }
  }

  // 50 files
  for (let i = 0; i < 50; i++) {
    const fileId = `mf-${i + 1}`;
    const fn = pick(BORROWER_FIRST_NAMES, s);
    const ln2 = pick(BORROWER_LAST_NAMES, s);
    const city = pick(CITIES, s);
    const street = `${randomInt(100, 9999, s)} ${pick(STREETS, s)}`;
    const lender = pick(LENDERS, s);
    const stage = pick(STAGES, s);
    const createdAt = daysAgo(randomInt(7, 120, s));
    const updatedAt = daysAgo(randomInt(0, 7, s));
    const specialist = s() < 0.15 ? null : pick(SPECIALISTS, s);
    const systemActor = specialist ?? SPECIALISTS[0];

    let saleDate: string | null = null;
    const sr = s();
    if (sr < 0.35) saleDate = daysFromNow(randomInt(1, 45, s));
    else if (sr < 0.5) saleDate = daysAgo(randomInt(1, 60, s));

    files.push({
      id: fileId,
      borrower: { id: `br-${i + 1}`, name: `${fn} ${ln2}`, phone: genPhone(s), email: `${fn.toLowerCase()}.${ln2.toLowerCase()}@email.com`, propertyAddress: `${street}, ${city.city}, ${city.state} ${randomInt(90000, 92899, s)}`, loanNumber: genLoanNumber(s), monthlyPayment: randomInt(1200, 4500, s) },
      specialist, lender,
      poc: contactByLender[lender.id] ? contacts.find((p) => p.id === contactByLender[lender.id]) ?? null : null,
      stage, saleDate, createdAt, updatedAt,
    });

    timeline.push({ id: `tl-${i}-0`, fileId, type: "file_created", actor: systemActor, description: specialist ? "File created and assigned" : "File created — unassigned", metadata: { specialistId: specialist?.id ?? "" }, createdAt });
    if (specialist && s() > 0.3) timeline.push({ id: `tl-${i}-1`, fileId, type: "file_assigned", actor: specialist, description: `File assigned to ${specialist.name}`, metadata: { specialistId: specialist.id }, createdAt: daysAgo(randomInt(5, 100, s)) });

    const tc = randomInt(2, 6, s);
    for (let t = 0; t < tc; t++) {
      const tid = `tk-${i}-${t}`;
      const title = pick(TASK_TITLES, s);
      const ts = pick(SPECIALISTS, s);
      const priority = pick(["High", "Medium", "Low"] as TaskPriority[], s);
      const done = s() < 0.35;
      const tcAt = daysAgo(randomInt(1, 30, s));
      let dd: string | null = null;
      const dr = s();
      if (dr < 0.2) dd = daysAgo(randomInt(1, 14, s));
      else if (dr < 0.35) dd = daysFromNow(0);
      else if (dr < 0.5) dd = daysFromNow(1);
      else if (dr < 0.8) dd = daysFromNow(randomInt(2, 21, s));
      tasks.push({ id: tid, fileId, title, description: null, assignedTo: ts, dueDate: dd, priority, status: done ? "Completed" : "Open", createdAt: tcAt, completedAt: done ? daysAgo(randomInt(0, 5, s)) : null });
      timeline.push({ id: `tl-${i}-t${t}`, fileId, type: done ? "task_completed" : "task_created", actor: ts, description: done ? `Task completed: ${title}` : `Task created: ${title}`, metadata: { taskId: tid }, createdAt: done ? daysAgo(randomInt(0, 5, s)) : tcAt });
    }

    const nc = randomInt(1, 4, s);
    for (let n = 0; n < nc; n++) {
      const na = pick(SPECIALISTS, s);
      const nAt = daysAgo(randomInt(0, 60, s));
      notes.push({ id: `nt-${i}-${n}`, fileId, author: na, body: pick(NOTE_BODIES, s), createdAt: nAt });
      timeline.push({ id: `tl-${i}-n${n}`, fileId, type: "note_added", actor: na, description: "Note added", metadata: null, createdAt: nAt });
    }

    const dc = randomInt(1, 4, s);
    for (let d = 0; d < dc; d++) {
      const doc = pick(DOC_TYPES, s);
      const up = pick(SPECIALISTS, s);
      const dAt = daysAgo(randomInt(0, 60, s));
      documents.push({ id: `dc-${i}-${d}`, fileId, name: doc.name, type: doc.type, uploadedBy: up, fileSize: randomInt(50000, 5000000, s), createdAt: dAt });
      timeline.push({ id: `tl-${i}-d${d}`, fileId, type: "document_uploaded", actor: up, description: `Document uploaded: ${doc.name}`, metadata: { docId: `dc-${i}-${d}` }, createdAt: dAt });
    }

    const sc = randomInt(0, 3, s);
    for (let st = 0; st < sc; st++) {
      const prev = pick(STAGES, s);
      timeline.push({ id: `tl-${i}-s${st}`, fileId, type: "stage_changed", actor: systemActor, description: `Stage changed from ${prev} to ${stage}`, metadata: { from: prev, to: stage }, createdAt: daysAgo(randomInt(1, 80, s)) });
    }
  }

  console.log(`Mock data seeded: ${files.length} files`);
  store = { specialists: SPECIALISTS, lenders: LENDERS, contacts, files, tasks, notes, timeline, documents };
  return store;
}

function notify() {
  listeners.forEach((l) => l());
}

// ─── React binding ───────────────────────────────────────────

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

// Snapshot counter — bumps on every mutation so useSyncExternalStore re-renders
let version = 0;
function getSnapshot() { return version; }

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// ─── Reads ───────────────────────────────────────────────────

export function getAllFiles(): MortgageFile[] {
  const s = getStore();
  return [...s.files].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getFileById(id: string): MortgageFileDetail | null {
  const s = getStore();
  const file = s.files.find((f) => f.id === id);
  if (!file) return null;
  return {
    ...file,
    tasks: s.tasks.filter((t) => t.fileId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    notes: s.notes.filter((n) => n.fileId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    timeline: s.timeline.filter((e) => e.fileId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    documents: s.documents.filter((d) => d.fileId === id).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  };
}

export function getDashboardData() {
  const s = getStore();
  const now = new Date().toISOString();
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString();
  return {
    allOpenTasks: s.tasks.filter((t) => t.status === "Open"),
    upcomingSaleDates: s.files
      .filter((f) => f.saleDate && f.saleDate >= now && f.saleDate <= in14 && f.stage !== "Completed" && f.stage !== "Rejected")
      .sort((a, b) => (a.saleDate! < b.saleDate! ? -1 : 1))
      .slice(0, 10),
    recentlyUpdatedFiles: [...s.files].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 8),
  };
}

export function getAllSpecialists(): Specialist[] { return getStore().specialists; }
export function getAllLenders(): Lender[] { return getStore().lenders; }
export function getAllLenderContacts(): LenderContact[] { return getStore().contacts; }

// ─── Mutations ───────────────────────────────────────────────

const nowISO = () => new Date().toISOString();

export function updateFileStage(fileId: string, stage: Stage, actorId: string): void {
  const s = getStore();
  const file = s.files.find((f) => f.id === fileId);
  if (!file) return;
  file.stage = stage;
  file.updatedAt = nowISO();
  const actor = s.specialists.find((sp) => sp.id === actorId) ?? s.specialists[0];
  s.timeline.push({ id: crypto.randomUUID(), fileId, type: "stage_changed", actor, description: `Stage changed to ${stage}`, metadata: { stage }, createdAt: nowISO() });
  version++; notify();
}

export function assignFile(fileId: string, specialistId: string | null, actorId: string): void {
  const s = getStore();
  const file = s.files.find((f) => f.id === fileId);
  if (!file) return;
  const specialist = specialistId ? s.specialists.find((sp) => sp.id === specialistId) ?? null : null;
  file.specialist = specialist;
  file.updatedAt = nowISO();
  const actor = s.specialists.find((sp) => sp.id === actorId) ?? s.specialists[0];
  s.timeline.push({ id: crypto.randomUUID(), fileId, type: "file_assigned", actor, description: specialist ? `File assigned to ${specialist.name}` : "File unassigned", metadata: { specialistId: specialistId ?? "" }, createdAt: nowISO() });
  version++; notify();
}

export function createTask(input: { fileId: string; title: string; description?: string; assignedToId: string; dueDate?: string; priority: TaskPriority; actorId: string }): Task {
  const s = getStore();
  const now = nowISO();
  const id = crypto.randomUUID();
  const specialist = s.specialists.find((sp) => sp.id === input.assignedToId) ?? s.specialists[0];
  const file = s.files.find((f) => f.id === input.fileId);
  if (file) file.updatedAt = now;
  const task: Task = { id, fileId: input.fileId, title: input.title, description: input.description ?? null, assignedTo: specialist, dueDate: input.dueDate ?? null, priority: input.priority, status: "Open", createdAt: now, completedAt: null };
  s.tasks.push(task);
  const actor = s.specialists.find((sp) => sp.id === input.actorId) ?? s.specialists[0];
  s.timeline.push({ id: crypto.randomUUID(), fileId: input.fileId, type: "task_created", actor, description: `Task created: ${input.title}`, metadata: { taskId: id }, createdAt: now });
  version++; notify();
  return task;
}

export function completeTask(taskId: string, actorId: string): void {
  const s = getStore();
  const task = s.tasks.find((t) => t.id === taskId);
  if (!task) return;
  const now = nowISO();
  task.status = "Completed";
  task.completedAt = now;
  const file = s.files.find((f) => f.id === task.fileId);
  if (file) file.updatedAt = now;
  const actor = s.specialists.find((sp) => sp.id === actorId) ?? s.specialists[0];
  s.timeline.push({ id: crypto.randomUUID(), fileId: task.fileId, type: "task_completed", actor, description: `Task completed: ${task.title}`, metadata: { taskId }, createdAt: now });
  version++; notify();
}

export function addNote(input: { fileId: string; authorId: string; body: string }): Note {
  const s = getStore();
  const now = nowISO();
  const id = crypto.randomUUID();
  const author = s.specialists.find((sp) => sp.id === input.authorId) ?? s.specialists[0];
  const note: Note = { id, fileId: input.fileId, author, body: input.body, createdAt: now };
  s.notes.push(note);
  s.timeline.push({ id: crypto.randomUUID(), fileId: input.fileId, type: "note_added", actor: author, description: "Note added", metadata: null, createdAt: now });
  const file = s.files.find((f) => f.id === input.fileId);
  if (file) file.updatedAt = now;
  version++; notify();
  return note;
}