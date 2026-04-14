"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, Panel, StatusBadge,
  LoadingDots, ProgressBar, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate"; // FIX — removed extra semicolon
import { toast } from "react-toastify";
import Link from "next/link";

interface Investment {
  id: string; amount: number; createdAt: string;
  project: { id: string; title: string; slug: string; status: string; goalAmount: number; currentAmount: number } | null;
}

export default function InvestorPortfolioPage() {
  const axiosPrivate = useAxiosPrivate();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [meta,        setMeta]        = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading,     setLoading]     = useState(true);
  const [sortBy,      setSortBy]      = useState<"date" | "amount">("date");

  // FIX 1 + 2 — correct URL and axiosPrivate in deps (was empty [])
  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await axiosPrivate.get(`/api/investor/investments?page=${page}&limit=20`);
      setInvestments(data.data ?? []);
      setMeta(data.meta);
    } catch { toast.error("Failed to load portfolio."); }
    finally { setLoading(false); }
  }, [axiosPrivate]); // ← was []

  useEffect(() => { load(); }, [load]);

  // FIX 1b — correct URL for cancel
  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this investment?")) return;
    try {
      await axiosPrivate.delete(`/api/investor/investments/${id}`);
      toast.success("Investment cancelled."); load();
    } catch { toast.error("Cancel failed."); }
  };

  const sorted = [...investments].sort((a, b) => {
    if (sortBy === "amount") return Number(b.amount) - Number(a.amount);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalInvested = investments.reduce((s, i) => s + Number(i.amount), 0);
  const avgAmount     = investments.length > 0 ? totalInvested / investments.length : 0;
  const activeCount   = investments.filter(i => i.project?.status === "ACTIVE").length;

  const allocation = Array.from(
    investments.reduce((acc, i) => {
      const key  = i.project?.id ?? "unknown";
      const prev = acc.get(key) ?? { title: i.project?.title ?? "Unknown", total: 0, count: 0, status: i.project?.status ?? "" };
      acc.set(key, { ...prev, total: prev.total + Number(i.amount), count: prev.count + 1 });
      return acc;
    }, new Map<string, { title: string; total: number; count: number; status: string }>()),
  ).map(([, v]) => v).sort((a, b) => b.total - a.total);

  const PALETTE = ["var(--emerald)", "var(--gold)", "var(--glow)", "var(--mid)", "#8B5CF6", "#F59E0B"];

  const cols = [
    {
      key: "project", label: "Project",
      render: (i: Investment) => (
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--deep)", marginBottom: 2 }}>{i.project?.title ?? "—"}</div>
          <StatusBadge status={i.project?.status ?? "ACTIVE"} />
        </div>
      ),
    },
    {
      key: "progress", label: "Project Progress",
      render: (i: Investment) => {
        const p = i.project;
        if (!p) return <span style={{ color: "var(--mgrey)" }}>—</span>;
        const pct = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.currentAmount) / Number(p.goalAmount)) * 100)) : 0;
        return (
          <div style={{ minWidth: 130 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.65rem", color: "var(--grey)" }}>{naira(p.currentAmount)}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} />
          </div>
        );
      },
    },
    {
      key: "amount", label: "My Investment", align: "right" as const,
      render: (i: Investment) => (
        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--glow)" }}>
          {naira(i.amount)}
        </span>
      ),
    },
    {
      key: "share", label: "Portfolio %",
      render: (i: Investment) => {
        const pct = totalInvested > 0 ? ((Number(i.amount) / totalInvested) * 100).toFixed(1) : "0";
        return <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mgrey)" }}>{pct}%</span>;
      },
    },
    {
      key: "createdAt", label: "Date",
      render: (i: Investment) => <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>{fmtDate(i.createdAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (i: Investment) => (
        <button onClick={() => handleCancel(i.id)} style={{
          padding: "4px 10px", borderRadius: 6, cursor: "pointer",
          fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
          background: "rgba(220,38,38,0.07)", color: "#dc2626",
          border: "1px solid rgba(220,38,38,0.2)",
          fontFamily: "var(--font-jost), sans-serif",
        }}>Cancel</button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <SectionHeader
        label="Investor"
        title="My Portfolio"
        action={
          <Link href="/dashboard/investor/explore">
            <button style={{ padding: "9px 20px", borderRadius: 8, cursor: "pointer", background: "var(--deep)", border: "none", color: "var(--cream)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jost), sans-serif" }}>
              + Explore Projects
            </button>
          </Link>
        }
      />

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Invested",  value: naira(totalInvested), color: "var(--emerald)" },
          { label: "Positions",       value: String(meta.total),   color: "var(--deep)" },
          { label: "Active Projects", value: String(activeCount),  color: "var(--mid)" },
          { label: "Avg Investment",  value: naira(avgAmount),     color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", boxShadow: "0 2px 10px var(--shadow)" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : investments.length === 0 ? (
        <EmptyState
          title="No investments yet"
          sub="Browse active projects and make your first contribution to Eleje Legacy."
          action={
            <Link href="/dashboard/investor/explore">
              <button style={{ padding: "10px 24px", background: "var(--deep)", color: "var(--cream)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-jost), sans-serif" }}>
                Explore Projects
              </button>
            </Link>
          }
        />
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}
            className="grid-cols-1 lg:grid-cols-2">

            {/* Allocation */}
            <Panel>
              <div style={{ marginBottom: 16 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}><div className="ey-dash" /><span className="ey-txt">Allocation</span></div>
                <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--deep)" }}>By Project</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {allocation.map((a, idx) => {
                  const pct = totalInvested > 0 ? (a.total / totalInvested) * 100 : 0;
                  return (
                    <div key={a.title}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                          <div style={{ fontSize: "0.6rem", color: "var(--mgrey)" }}>{a.count} position{a.count !== 1 ? "s" : ""}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "var(--deep)" }}>{naira(a.total)}</div>
                          <div style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>{pct.toFixed(1)}%</div>
                        </div>
                      </div>
                      <ProgressBar pct={pct} color={PALETTE[idx % PALETTE.length]} />
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Timeline */}
            <Panel>
              <div style={{ marginBottom: 16 }}>
                <div className="eyebrow" style={{ marginBottom: 4 }}><div className="ey-dash" /><span className="ey-txt">Timeline</span></div>
                <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--deep)" }}>Investment History</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {sorted.slice(0, 6).map((i, idx) => (
                  <div key={i.id} style={{ display: "flex", gap: 14, alignItems: "flex-start",
                    paddingBottom: idx < Math.min(sorted.length, 6) - 1 ? 16 : 0,
                    borderBottom: idx < Math.min(sorted.length, 6) - 1 ? "1px solid var(--border)" : "none",
                    marginBottom: idx < Math.min(sorted.length, 6) - 1 ? 16 : 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0, background: "var(--glow)", marginTop: 4, boxShadow: "0 0 0 3px rgba(52,211,153,0.2)" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.project?.title ?? "Unknown Project"}</span>
                        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", fontWeight: 700, color: "var(--glow)", flexShrink: 0 }}>{naira(i.amount)}</span>
                      </div>
                      <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>{fmtDate(i.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* Full table */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <div className="eyebrow" style={{ margin: 0 }}><div className="ey-dash" /><span className="ey-txt">All Positions</span></div>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ fontSize: "0.62rem", color: "var(--mgrey)", alignSelf: "center" }}>Sort:</span>
                {(["date", "amount"] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", border: "none", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-jost), sans-serif", background: sortBy === s ? "var(--deep)" : "var(--warm2)", color: sortBy === s ? "var(--cream)" : "var(--grey)" }}>
                    {s === "date" ? "Latest" : "Largest"}
                  </button>
                ))}
              </div>
            </div>
            <DataTable columns={cols} rows={sorted} empty="No investments found." />
          </div>

          <Pagination meta={meta} onPage={load} />
        </>
      )}
    </DashboardLayout>
  );
}

function Pagination({ meta, onPage }: any) {
  if (meta.totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", border: "1px solid var(--border)", background: p === meta.page ? "var(--deep)" : "var(--warm)", color: p === meta.page ? "var(--cream)" : "var(--grey)", fontSize: "0.78rem" }}>{p}</button>
      ))}
    </div>
  );
}