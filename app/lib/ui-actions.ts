import { useSyncExternalStore } from "react"
import type { Stage } from "./types"

// UI action placeholders. Persistence will be connected to Salesforce later.

let version = 0
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return version
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function updateFileStage(
  _fileId: string,
  _stage: Stage,
  _actorId: string,
): void {
  // Salesforce persistence will be connected in a later step.
}

export function assignFile(
  _fileId: string,
  _specialistId: string | null,
  _actorId: string,
): void {
  // Salesforce persistence will be connected in a later step.
}

export function addNote(_input: {
  fileId: string
  authorId: string
  body: string
}): void {
  // Salesforce persistence will be connected in a later step.
}