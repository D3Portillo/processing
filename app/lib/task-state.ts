import { atom } from "jotai"

export const taskFiltersAtom = atom<{
  ownerId: string
  filter: "today" | "tomorrow" | "upcoming" | "overdue"
}>({
  ownerId: "",
  filter: "today",
})

export const fileFiltersAtom = atom<{
  ownerId: string
  query: string
}>({
  ownerId: "",
  query: "",
})
