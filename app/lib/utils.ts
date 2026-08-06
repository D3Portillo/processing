import classnames from "classnames";
import { format, parseISO } from "date-fns";
import { addDays, daysBetween, todayInTz } from "./dates";

export { classnames as cn };

export async function jsonify<T>(
  response: Response | Promise<Response>,
  fallbackMessage = "Request failed",
): Promise<T> {
  const resolvedResponse = await response
  const data = (await resolvedResponse.json()) as T | { error?: string }

  if (!resolvedResponse.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? data.error
        : undefined
    throw new Error(message ?? fallbackMessage)
  }

  return data as T
}

function isCalendarDateString(value: Date | string | number): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)
  )
}

function formatDateOnly(value: string): string {
  return format(parseISO(value.slice(0, 10)), "MMM d, yyyy")
}

export function formatDate(date: Date | string | number): string {
  if (isCalendarDateString(date)) return formatDateOnly(date)

  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelative(date: Date | string | number): string {
  if (isCalendarDateString(date)) {
    const calendarDate = date.slice(0, 10)
    const diffDays = daysBetween(todayInTz(), calendarDate)

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays <= 7) return `In ${diffDays}d`;
    return formatDate(calendarDate);
  }

  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
  if (diffDays <= 7) return `In ${diffDays}d`;
  return formatDate(d);
}

export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

export function colorFromString(value: string): string {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  const color = (hash >>> 0).toString(16).padStart(6, "0").slice(-6)
  return `#${color}`
}

export function isOverdue(date: Date | string | number): boolean {
  if (isCalendarDateString(date)) return date.slice(0, 10) < todayInTz();
  return new Date(date).getTime() < new Date().setHours(0, 0, 0, 0);
}

export function isToday(date: Date | string | number): boolean {
  if (isCalendarDateString(date)) return date.slice(0, 10) === todayInTz();

  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

export function isTomorrow(date: Date | string | number): boolean {
  if (isCalendarDateString(date)) {
    return date.slice(0, 10) === addDays(todayInTz(), 1)
  }

  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate();
}