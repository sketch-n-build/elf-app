/**
 * Converts a human-readable title into a URL-safe slug.
 * e.g. "Build a School in Lagos!" → "build-a-school-in-lagos"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars (except spaces & hyphens)
    .replace(/[\s_]+/g, "-")    // spaces / underscores → hyphens
    .replace(/-+/g, "-")        // collapse multiple hyphens
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

/**
 * Appends a short random suffix to guarantee uniqueness without a DB round-trip.
 * Use when you've already checked the clean slug is taken.
 */
export function uniqueSlug(text: string): string {
  const suffix = Math.random().toString(36).slice(2, 7); // e.g. "k4d9z"
  return `${slugify(text)}-${suffix}`;
}