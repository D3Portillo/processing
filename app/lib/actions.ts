"use server";

import {
  updateFileStage as _updateFileStage,
  assignFile as _assignFile,
  createTask as _createTask,
  completeTask as _completeTask,
  addNote as _addNote,
} from "./mock-data";
import type { Stage, TaskPriority } from "./types";

export async function completeTaskAction(taskId: string, actorId: string) {
  _completeTask(taskId, actorId);
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
  _createTask(input);
}

export async function addNoteAction(input: { fileId: string; authorId: string; body: string }) {
  _addNote(input);
}

export async function updateStageAction(fileId: string, stage: Stage, actorId: string) {
  _updateFileStage(fileId, stage, actorId);
}

export async function assignFileAction(fileId: string, specialistId: string | null, actorId: string) {
  _assignFile(fileId, specialistId, actorId);
}