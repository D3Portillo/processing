// Date helpers anchored to the business timezone (America/Los_Angeles).
// All "today", cadence, and due-date math must go through these so there's
// no drift from the server's timezone.

export const BUSINESS_TZ = "America/Los_Angeles"

// Returns the current date in the business timezone as a YYYY-MM-DD string.
export function todayInTz(tz: string = BUSINESS_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

// Adds `days` to a YYYY-MM-DD date string and returns a new YYYY-MM-DD string.
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// Number of whole days from `from` (YYYY-MM-DD) to `to` (YYYY-MM-DD).
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number)
  const [ty, tm, td] = to.split("-").map(Number)
  const a = Date.UTC(fy, fm - 1, fd)
  const b = Date.UTC(ty, tm - 1, td)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

// Normalizes an ISO timestamp (from Salesforce) to a YYYY-MM-DD date in the
// business timezone. Returns null for empty/invalid input.
export function toDateInTz(
  value: string | null | undefined,
  tz: string = BUSINESS_TZ,
): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}
