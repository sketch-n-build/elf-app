// import { ProjectCreator, ProjectStatus } from "@/types/project";

import { ProjectCreator, ProjectStatus } from "./types/Project";

export function fullName(creator: ProjectCreator): string {
  return `${creator.firstName} ${creator.lastName}`;
}

export function initials(creator: ProjectCreator): string {
  return `${creator.firstName[0]}${creator.lastName[0]}`;
}

export function statusLabel(status: ProjectStatus): string {
  return { ACTIVE: "Active", COMPLETED: "Completed", PAUSED: "Paused" }[status];
}

export function statusColor(status: ProjectStatus): string {
  return {
    ACTIVE:    "var(--mid)",
    COMPLETED: "var(--gold)",
    PAUSED:    "var(--mgrey)",
  }[status];
}

export function progressPercent(current: number, goal: number): number {
  if (!goal || goal === 0) return 0;
  return Math.min(100, Math.round((current / goal) * 100));
}

export function formatNaira(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)     return `₦${(amount / 1_000).toFixed(0)}K`;
  return `₦${amount.toLocaleString()}`;
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Truncate description to a short preview */
export function excerpt(text: string, maxChars = 140): string {
  const flat = text
    .replace(/^#+\s+.*/gm, "")   // strip headings
    .replace(/\*\*(.*?)\*\*/g, "$1") // strip bold
    .replace(/>\s+/g, "")        // strip blockquote markers
    .replace(/- /g, "")          // strip list markers
    .replace(/\n+/g, " ")
    .trim();
  return flat.length > maxChars ? flat.slice(0, maxChars).trimEnd() + "…" : flat;
}