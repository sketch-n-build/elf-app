"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, Panel, StatusBadge, ActionButton,
  LoadingDots, ProgressBar, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate"; // FIX — removed extra semicolon
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

interface Project {
  id: string; title: string; slug: string; description: string;
  coverImage: string | null; goalAmount: number; currentAmount: number;
  status: string; isFeatured: boolean; createdAt: string;
  createdBy: { firstName: string; lastName: string };
  _count?: { donations: number };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

export default function InvestorExplorePage() {
  const axiosPrivate = useAxiosPrivate();

  const [projects,       setProjects]       = useState<Project[]>([]);
  const [meta,           setMeta]           = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [featured,       setFeatured]       = useState(false);
  const [myInvestmentIds, setMyIds]         = useState<Set<string>>(new Set());
  const [investModal,    setInvestModal]    = useState<Project | null>(null);
  const [investAmount,   setInvestAmount]   = useState("");
  const [investing,      setInvesting]      = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12", status: "ACTIVE" });
      if (search)   p.set("search", search);
      if (featured) p.set("featured", "true");

      const [projRes, invRes] = await Promise.all([
        // Public project browsing — /api/projects is intentionally NOT scoped
        axiosPrivate.get(`/api/projects?${p}`),
        // FIX 1 — investor-scoped investments for the "already invested" check
        axiosPrivate.get("/api/investor/investments?limit=200"),
      ]);

      setProjects(projRes.data.data ?? []);
      setMeta(projRes.data.meta);
      const ids = new Set<string>((invRes.data.data ?? []).map((i: any) => i.projectId as string));
      setMyIds(ids);
    } catch { toast.error("Failed to load projects."); }
    finally { setLoading(false); }
  }, [search, featured, axiosPrivate]);

  useEffect(() => { load(); }, [load]);

  const handleInvest = async () => {
    if (!investModal || !investAmount || Number(investAmount) <= 0) {
      toast.warning("Enter a valid amount."); return;
    }
    setInvesting(true);
    try {
      // FIX 2 — correct URL for creating investment
      await axiosPrivate.post("/api/investor/investments", {
        projectId: investModal.id,
        amount:    Number(investAmount),
      });
      toast.success(`Investment of ${naira(Number(investAmount))} recorded!`);
      setMyIds(prev => new Set([...prev, investModal.id]));
      setInvestModal(null);
      setInvestAmount("");
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Investment failed."); }
    finally { setInvesting(false); }
  };

  const QUICK_AMOUNTS = [10000, 50000, 100000, 250000, 500000];

  return (
    <DashboardLayout>
      <SectionHeader label="Investor" title="Explore Projects" />

      {/* Intro banner */}
      <div style={{ background: "linear-gradient(135deg, var(--deep) 0%, var(--emerald) 60%, var(--glow) 100%)", borderRadius: 20, padding: "28px 32px", marginBottom: 28, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", bottom: -20, left: "40%", width: 140, height: 140, borderRadius: "50%", background: "rgba(52,211,153,0.1)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(168,230,216,0.65)", marginBottom: 8 }}>Active Opportunities</div>
          <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "clamp(1.2rem, 2.5vw, 1.7rem)", fontWeight: 700, color: "var(--cream)", lineHeight: 1.3, maxWidth: 500, marginBottom: 6 }}>Invest in projects that build a better Nigeria.</p>
          <p style={{ fontSize: "0.78rem", color: "rgba(168,230,216,0.6)", fontFamily: "var(--font-lora), Georgia, serif", lineHeight: 1.6 }}>Every investment goes directly toward impact programmes across education, health, and enterprise.</p>
        </div>
      </div>

      {/* Filters */}
      <Panel style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--mgrey)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" style={{ ...inputStyle, paddingLeft: 36 }} />
          </div>
          <button onClick={() => setFeatured(f => !f)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 8, cursor: "pointer", border: `1px solid ${featured ? "rgba(201,168,76,0.4)" : "var(--border)"}`, background: featured ? "rgba(201,168,76,0.1)" : "var(--warm2)", color: featured ? "var(--gold)" : "var(--grey)", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-jost), sans-serif" }}>
            <span>★</span> Featured Only
          </button>
          <span style={{ fontSize: "0.7rem", color: "var(--mgrey)" }}>{meta.total} active project{meta.total !== 1 ? "s" : ""}</span>
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects found" sub="Try adjusting your search or check back later for new opportunities." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: 20, marginBottom: 28 }}>
          {projects.map(p => (
            <ExploreProjectCard
              key={p.id}
              project={p}
              alreadyInvested={myInvestmentIds.has(p.id)}
              onInvest={() => { setInvestModal(p); setInvestAmount(""); }}
            />
          ))}
        </div>
      )}

      <Pagination meta={meta} onPage={load} />

      {/* Invest Modal */}
      {investModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }} onClick={() => setInvestModal(null)}>
          <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 460, boxShadow: "0 24px 80px rgba(6,78,56,0.25)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            {/* Gradient header */}
            <div style={{ background: "linear-gradient(135deg, var(--deep), var(--emerald))", padding: "24px 28px 20px" }}>
              <div style={{ fontSize: "0.54rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(168,230,216,0.6)", marginBottom: 6 }}>New Investment</div>
              <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--cream)", lineHeight: 1.25 }}>{investModal.title}</h2>
              <p style={{ fontSize: "0.72rem", color: "rgba(168,230,216,0.65)", fontFamily: "var(--font-lora), Georgia, serif", lineHeight: 1.6, marginTop: 6 }}>{investModal.description?.slice(0, 100)}…</p>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {/* Project progress */}
              <div style={{ marginBottom: 20 }}>
                {(() => {
                  const pct = investModal.goalAmount > 0
                    ? Math.min(100, Math.round((Number(investModal.currentAmount) / Number(investModal.goalAmount)) * 100))
                    : 0;
                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--grey)" }}>{naira(investModal.currentAmount)} raised</span>
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}% of {naira(investModal.goalAmount)}</span>
                      </div>
                      <ProgressBar pct={pct} />
                    </>
                  );
                })()}
              </div>

              {/* Quick amounts */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 8 }}>Quick Select</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {QUICK_AMOUNTS.map(amt => (
                    <button key={amt} onClick={() => setInvestAmount(String(amt))} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", border: `1px solid ${investAmount === String(amt) ? "var(--mid)" : "var(--border)"}`, background: investAmount === String(amt) ? "rgba(16,185,129,0.1)" : "var(--warm)", color: investAmount === String(amt) ? "var(--mid)" : "var(--grey)", fontSize: "0.72rem", fontFamily: "var(--font-jost), sans-serif", fontWeight: 600, transition: "all 0.15s" }}>
                      {naira(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>Custom Amount (₦)</label>
                <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} placeholder="Enter any amount" style={{ ...inputStyle, fontSize: "1rem", fontWeight: 500 }} />
                {investAmount && Number(investAmount) > 0 && (
                  <div style={{ fontSize: "0.72rem", color: "var(--mid)", marginTop: 4, fontWeight: 500 }}>You're investing {naira(Number(investAmount))}</div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleInvest} disabled={investing || !investAmount || Number(investAmount) <= 0}
                  style={{ flex: 1, padding: "12px", borderRadius: 10, cursor: investing ? "not-allowed" : "pointer", background: investing || !investAmount ? "var(--mgrey)" : "var(--deep)", border: "none", color: "var(--cream)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--font-jost), sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {investing ? <><Spinner /> Processing…</> : "Confirm Investment"}
                </button>
                <button onClick={() => setInvestModal(null)} style={{ padding: "12px 20px", borderRadius: 10, cursor: "pointer", border: "1px solid var(--border)", background: "var(--warm)", color: "var(--grey)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-jost), sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ── Explore Project Card ── */
function ExploreProjectCard({ project: p, alreadyInvested, onInvest }: {
  project: Project; alreadyInvested: boolean; onInvest: () => void;
}) {
  const pct = p.goalAmount > 0
    ? Math.min(100, Math.round((Number(p.currentAmount) / Number(p.goalAmount)) * 100))
    : 0;

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 14px var(--shadow)", display: "flex", flexDirection: "column", transition: "transform 0.22s, box-shadow 0.22s" }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 40px rgba(6,78,56,0.16)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px var(--shadow)"; }}>
      {/* Cover */}
      <div style={{ height: 150, flexShrink: 0, position: "relative", background: p.coverImage ? `url(${p.coverImage}) center/cover` : "linear-gradient(135deg, var(--ink) 0%, var(--deep) 50%, var(--emerald) 100%)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,14,10,0.65), transparent)" }} />
        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
          {p.isFeatured && <span style={{ fontSize: "0.54rem", letterSpacing: "0.14em", textTransform: "uppercase", background: "rgba(201,168,76,0.9)", color: "var(--ink)", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>★ Featured</span>}
          {alreadyInvested && <span style={{ fontSize: "0.54rem", letterSpacing: "0.14em", textTransform: "uppercase", background: "rgba(52,211,153,0.85)", color: "var(--ink)", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>✓ Invested</span>}
        </div>
        <div style={{ position: "absolute", bottom: 12, left: 14 }}><StatusBadge status={p.status} /></div>
        <div style={{ position: "absolute", bottom: 12, right: 14, fontSize: "0.62rem", color: "rgba(255,255,255,0.65)" }}>{p._count?.donations ?? 0} donors</div>
      </div>

      <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.25, marginBottom: 6 }}>{p.title}</h3>
          <p style={{ fontSize: "0.74rem", color: "var(--grey)", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", fontFamily: "var(--font-lora), Georgia, serif" }}>{p.description}</p>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--grey)" }}>{naira(p.currentAmount)} raised</span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} color={pct >= 75 ? "var(--glow)" : "var(--emerald)"} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>Goal: {naira(p.goalAmount)}</span>
            <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>By {p.createdBy?.firstName} {p.createdBy?.lastName}</span>
          </div>
        </div>
        <button onClick={onInvest} style={{ marginTop: "auto", width: "100%", padding: "11px", borderRadius: 10, cursor: "pointer", border: alreadyInvested ? "1px solid var(--border)" : "none", background: alreadyInvested ? "var(--warm2)" : "var(--deep)", color: alreadyInvested ? "var(--emerald)" : "var(--cream)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--font-jost), sans-serif", transition: "opacity 0.18s" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
          {alreadyInvested ? "+ Invest More in This Project" : "Invest in This Project"}
        </button>
      </div>
    </div>
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