/**
 * Format a date into a human-readable string like "March 8, 2026"
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-NG", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });
}

/**
 * Estimate reading time from plain text content (strips markdown)
 */
export function readingTime(content: string): string {
  const words  = content.replace(/[#*_`[\]()>!]/g, " ").split(/\s+/).filter(Boolean);
  const mins   = Math.max(1, Math.ceil(words.length / 220));
  return `${mins} min read`;
}

/**
 * Return initials from a name string
 */
export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Truncate a string to `n` chars and append ellipsis
 */
export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n).trimEnd() + "…" : str;
}