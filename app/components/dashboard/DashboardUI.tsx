"use client";

import { ReactNode } from "react";

/* ────────────────────────────────────────────────────────────────────
   StatCard
────────────────────────────────────────────────────────────────────── */
interface StatCardProps {
  label:     string;
  value:     string | number;
  sub?:      string;
  icon?:     ReactNode;
  accent?:   string;
  trend?:    { value: string; up: boolean };
}

export function StatCard({ label, value, sub, icon, accent = "var(--emerald)", trend }: StatCardProps) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 2px 16px var(--shadow)",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(6,78,56,0.13)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px var(--shadow)";
    }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, transparent)`,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{
          fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--mgrey)", fontWeight: 500,
        }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${accent}12`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: accent,
          }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "2.2rem", fontWeight: 700, color: "var(--deep)",
        lineHeight: 1, marginBottom: 6,
      }}>
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {sub && (
          <span style={{ fontSize: "0.72rem", color: "var(--grey)" }}>{sub}</span>
        )}
        {trend && (
          <span style={{
            fontSize: "0.65rem", fontWeight: 600,
            color: trend.up ? "var(--mid)" : "#dc2626",
            background: trend.up ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.08)",
            padding: "2px 7px", borderRadius: 20,
          }}>
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   SectionHeader
────────────────────────────────────────────────────────────────────── */
interface SectionHeaderProps {
  label:    string;
  title:    string;
  action?:  ReactNode;
}

export function SectionHeader({ label, title, action }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          <div className="ey-dash" />
          <span className="ey-txt">{label}</span>
        </div>
        <h2 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.6rem", fontWeight: 700, color: "var(--deep)",
          lineHeight: 1,
        }}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   DataTable
────────────────────────────────────────────────────────────────────── */
interface Column<T> {
  key:     keyof T | string;
  label:   string;
  render?: (row: T) => ReactNode;
  align?:  "left" | "right" | "center";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows:    T[];
  empty?:  string;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({ columns, rows, empty = "No records found.", loading }: DataTableProps<T>) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: 16, overflow: "hidden",
      boxShadow: "0 2px 16px var(--shadow)",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--warm)", borderBottom: "1px solid var(--border)" }}>
              {columns.map(col => (
                <th key={String(col.key)} style={{
                  padding: "11px 16px",
                  textAlign: col.align ?? "left",
                  fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "var(--mgrey)", fontWeight: 600,
                  whiteSpace: "nowrap",
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} style={{ padding: 40, textAlign: "center" }}>
                <LoadingDots />
              </td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{
                padding: "36px 16px", textAlign: "center",
                color: "var(--mgrey)", fontSize: "0.82rem",
              }}>
                {empty}
              </td></tr>
            ) : rows.map((row, i) => (
              <tr key={i} style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--warm)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {columns.map(col => (
                  <td key={String(col.key)} style={{
                    padding: "13px 16px",
                    textAlign: col.align ?? "left",
                    fontSize: "0.82rem", color: "var(--ink)",
                  }}>
                    {col.render ? col.render(row) : row[col.key as string] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   ProgressBar
────────────────────────────────────────────────────────────────────── */
export function ProgressBar({ pct, color = "var(--emerald)" }: { pct: number; color?: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div style={{ height: 6, background: "var(--warm2)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${clamped}%`,
        background: `linear-gradient(90deg, ${color}, var(--glow))`,
        borderRadius: 99, transition: "width 0.6s ease",
      }} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   StatusBadge
────────────────────────────────────────────────────────────────────── */
const statusStyles: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: "rgba(16,185,129,0.1)",   color: "var(--mid)" },
  COMPLETED: { bg: "rgba(6,78,56,0.08)",     color: "var(--deep)" },
  PAUSED:    { bg: "rgba(201,168,76,0.12)",  color: "var(--gold)" },
  SUCCESS:   { bg: "rgba(16,185,129,0.1)",   color: "var(--mid)" },
  PENDING:   { bg: "rgba(201,168,76,0.12)",  color: "var(--gold)" },
  FAILED:    { bg: "rgba(220,38,38,0.08)",   color: "#dc2626" },
  PUBLISHED: { bg: "rgba(16,185,129,0.1)",   color: "var(--mid)" },
  DRAFT:     { bg: "rgba(138,168,153,0.15)", color: "var(--mgrey)" },
  ADMIN:     { bg: "rgba(201,168,76,0.12)",  color: "var(--gold)" },
  STAFF:     { bg: "rgba(16,185,129,0.1)",   color: "var(--mid)" },
  INVESTOR:  { bg: "rgba(52,211,153,0.1)",   color: "var(--glow)" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status.toUpperCase()] ?? { bg: "var(--warm2)", color: "var(--grey)" };
  return (
    <span style={{
      fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────
   ActionButton
────────────────────────────────────────────────────────────────────── */
interface ActionButtonProps {
  onClick?:   () => void;
  href?:      string;
  children:   ReactNode;
  variant?:   "primary" | "ghost" | "danger";
  size?:      "sm" | "md";
  disabled?:  boolean;
}

export function ActionButton({ onClick, children, variant = "primary", size = "md", disabled }: ActionButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--deep)", color: "var(--cream)" },
    ghost:   { background: "transparent", color: "var(--emerald)",
               border: "1px solid var(--emerald)" },
    danger:  { background: "rgba(220,38,38,0.08)", color: "#dc2626",
               border: "1px solid rgba(220,38,38,0.2)" },
  };
  const padding = size === "sm" ? "6px 14px" : "9px 20px";
  const fontSize = size === "sm" ? "0.62rem" : "0.68rem";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding, fontSize,
        letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600,
        borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        border: styles[variant].border ?? "none",
        fontFamily: "var(--font-jost), sans-serif",
        transition: "opacity 0.18s, transform 0.18s",
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget.style.opacity = "0.82"); }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget.style.opacity = "1"); }}
    >
      {children}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────
   PageTitle
────────────────────────────────────────────────────────────────────── */
export function PageTitle({ greeting, name, sub }: { greeting: string; name: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: "0.62rem", letterSpacing: "0.28em", textTransform: "uppercase",
        color: "var(--mgrey)", marginBottom: 6 }}>
        {greeting}
      </div>
      <h1 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700,
        color: "var(--deep)", lineHeight: 1.1,
      }}>
        {name}
      </h1>
      {sub && (
        <p style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--grey)",
          fontFamily: "var(--font-lora), Georgia, serif", lineHeight: 1.7 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Panel (card wrapper)
────────────────────────────────────────────────────────────────────── */
export function Panel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)",
      borderRadius: 16, padding: 24,
      boxShadow: "0 2px 16px var(--shadow)",
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   LoadingDots
────────────────────────────────────────────────────────────────────── */
export function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "var(--mid)", display: "inline-block",
          animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
      <style>{`
        @keyframes dotBounce {
          0%,80%,100% { transform: scale(0.7); opacity: 0.4; }
          40%          { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────
   EmptyState
────────────────────────────────────────────────────────────────────── */
export function EmptyState({ icon, title, sub, action }: {
  icon?: ReactNode; title: string; sub?: string; action?: ReactNode
}) {
  return (
    <div style={{
      textAlign: "center", padding: "52px 24px",
      background: "#fff", borderRadius: 16,
      border: "1px solid var(--border)",
    }}>
      {icon && (
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: "var(--warm2)", display: "flex",
          alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px", color: "var(--mgrey)",
        }}>
          {icon}
        </div>
      )}
      <div style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "1.3rem", fontWeight: 700, color: "var(--deep)", marginBottom: 8,
      }}>
        {title}
      </div>
      {sub && <p style={{ fontSize: "0.82rem", color: "var(--grey)", marginBottom: 20 }}>{sub}</p>}
      {action}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Naira formatter
────────────────────────────────────────────────────────────────────── */
export function naira(n: number | string) {
  const num = Number(n);
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000)     return `₦${(num / 1_000).toFixed(0)}K`;
  return `₦${num.toLocaleString()}`;
}

export function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}