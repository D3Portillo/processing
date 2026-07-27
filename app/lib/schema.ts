import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ─── Specialists ─────────────────────────────────────────────
export const specialists = sqliteTable("specialists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatarColor: text("avatar_color").notNull(),
});

// ─── Lenders ─────────────────────────────────────────────────
export const lenders = sqliteTable("lenders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
});

// ─── Borrowers ───────────────────────────────────────────────
export const borrowers = sqliteTable("borrowers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  propertyAddress: text("property_address").notNull(),
  loanNumber: text("loan_number").notNull(),
});

// ─── Mortgage Files ──────────────────────────────────────────
export const mortgageFiles = sqliteTable("mortgage_files", {
  id: text("id").primaryKey(),
  borrowerId: text("borrower_id").notNull().references(() => borrowers.id),
  specialistId: text("specialist_id").notNull().references(() => specialists.id),
  lenderId: text("lender_id").notNull().references(() => lenders.id),
  stage: text("stage").notNull(),
  saleDate: text("sale_date"), // ISO date or null
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ─── Tasks ───────────────────────────────────────────────────
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull().references(() => mortgageFiles.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedToId: text("assigned_to_id").notNull().references(() => specialists.id),
  dueDate: text("due_date"),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

// ─── Notes ───────────────────────────────────────────────────
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull().references(() => mortgageFiles.id),
  authorId: text("author_id").notNull().references(() => specialists.id),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
});

// ─── Timeline Events ─────────────────────────────────────────
export const timelineEvents = sqliteTable("timeline_events", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull().references(() => mortgageFiles.id),
  type: text("type").notNull(),
  actorId: text("actor_id").notNull().references(() => specialists.id),
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string
  createdAt: text("created_at").notNull(),
});

// ─── Documents ───────────────────────────────────────────────
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull().references(() => mortgageFiles.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  uploadedById: text("uploaded_by_id").notNull().references(() => specialists.id),
  fileSize: integer("file_size").notNull(),
  createdAt: text("created_at").notNull(),
});