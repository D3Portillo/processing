import { atomWithStorage } from "jotai/utils"

export const taskFiltersAtom = atomWithStorage<{
  ownerId: string
  filter: "today" | "tomorrow" | "upcoming" | "overdue"
}>("processing:task-filters", {
  ownerId: "",
  filter: "today",
})

export const fileFiltersAtom = atomWithStorage<{
  ownerId: string
  query: string
}>("processing:file-filters", {
  ownerId: "",
  query: "",
})
