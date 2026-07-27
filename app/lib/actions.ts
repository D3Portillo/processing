"use server";

import { getRepository } from "@/app/lib/repo-instance";
import type { Stage, TaskPriority } from "@/app/lib/types";

export async function completeTaskAction(taskId: string, actorId: string) {
  await getRepository().completeTask(taskId, actorId);
}

export async function createTaskAction(input: {
  fileId: string;
  title: string;
  description?: string;
  assignedToId: string;
  dueDate?: string;
  priority: TaskPriority;
  actorId: string;
}) {
  await getRepository().createTask(input);
}

export async function addNoteAction(input: {
  fileId: string;
  authorId: string;
  body: string;
}) {
  await getRepository().addNote(input);
}

export async function updateStageAction(fileId: string, stage: Stage, actorId: string) {
  await getRepository().updateFileStage(fileId, stage, actorId);
}

export async function seedDatabaseAction() {
  const { seedDatabase } = await import("@/app/lib/seed");
  await seedDatabase();
}