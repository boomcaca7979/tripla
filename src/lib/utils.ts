import {
  eachDayOfInterval,
  differenceInDays,
  format,
  isPast,
  parse,
} from "date-fns";

// ─── Date utilities ─────────────────────────────────────────────────────────

/**
 * Formats a YYYY-MM-DD string into a human-readable date (e.g. "Dec 25, 2025").
 */
export function formatDateDisplay(date: string, locale?: string): string {
  const parsed = parse(date, "yyyy-MM-dd", new Date());
  return format(parsed, "MMM d, yyyy", locale ? ({ locale } as unknown as Parameters<typeof format>[2]) : undefined);
}

/**
 * Returns all "YYYY-MM-DD" strings between `start` and `end` (inclusive).
 */
export function getDateRange(start: string, end: string): string[] {
  return eachDayOfInterval({
    start: new Date(start),
    end: new Date(end),
  }).map((date) => format(date, "yyyy-MM-dd"));
}

/**
 * Returns the number of whole days from `start` to `end` (inclusive).
 */
export function calculateTripDuration(start: string, end: string): number {
  return differenceInDays(new Date(end), new Date(start)) + 1;
}

/**
 * Returns `true` when `date` is before the current moment.
 */
export function isDateInPast(date: string): boolean {
  return isPast(new Date(date));
}

// ─── Temperature utilities ──────────────────────────────────────────────────

/**
 * Converts Celsius to Fahrenheit.
 */
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

/**
 * Formats a temperature value with its unit symbol.
 */
export function formatTemperature(c: number, unit: "C" | "F"): string {
  if (unit === "F") {
    return `${Math.round(celsiusToFahrenheit(c))}°F`;
  }
  return `${Math.round(c)}°C`;
}

// ─── String utilities ───────────────────────────────────────────────────────

/**
 * Truncates `text` to `maxLength` characters, appending "…" when cut.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Converts arbitrary text into a URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Performance utilities ──────────────────────────────────────────────────

/**
 * Returns a debounced version of `fn` that delays invocation until
 * `delayMs` milliseconds have elapsed since the last call.
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
      timer = undefined;
    }, delayMs);
  };
}

// ─── ID generation ──────────────────────────────────────────────────────────

/** Generates a short unique ID without any library dependencies. */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
