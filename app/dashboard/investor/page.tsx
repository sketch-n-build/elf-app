"use client";
import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import { StatCard, SectionHeader, DataTable, ActionButton, Panel, PageTitle, LoadingDots, ProgressBar, StatusBadge, EmptyState, naira, fmtDate } from "@/app/components/dashboard/DashboardUI";
import { useUserStore } from "@/app/store/useUserStore";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

const Icons = {
  Portfolio: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  Trend:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>,
  Projects:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/><path d="M2 10h20"/></svg>,
  Globe:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
};

export default function InvestorDashboardPage() {
  const { user, loadingUser } = useUserStore();
  const axiosPrivate = useAxiosPrivate();
  const [investments, setInvestments] = useState<any[]>([]);
  const [projects, setProjects]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [investing, setInvesting]     = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState("");
  const [investModal, setInvestModal] = useState<any>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const load = useCallback(async () => {
    try {
      const [invRes, projRes] = await Promise.all([
        axiosPrivate.get("/api/investor/investments?limit=100"),
        axiosPrivate.get("/api/investor/projects?status=ACTIVE&limit=12"),
      ]);
      setInvestments(invRes.data.data ?? []);
      setProjects(projRes.data.data ?? []);
    } catch {
      toast.error("Failed to load your portfolio.");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  // ✅ Gate on loadingUser
  useEffect(() => {
    // if (loadingUser) return;
    load();
  }, [load]);

  const totalInvested  = investments.reduce((s, i) => s + Number(i.amount), 0);
  const uniqueProjects = new Set(investments.map(i => i.projectId)).size;
  const avgInvestment  = investments.length > 0 ? totalInvested / investments.length : 0;
  const topProject     = investments.reduce<any>((top, i) => (!top || Number(i.amount) > Number(top.amount)) ? i : top, null);

  const handleInvest = async () => {
    if (!investModal || !investAmount || Number(investAmount) <= 0) { toast.warning("Enter a valid investment amount."); return; }
    setInvesting(investModal.id);
    try {
      await axiosPrivate.post("/api/investor/investments", { projectId: investModal.id, amount: Number(investAmount) });
      toast.success(`Investment of ${naira(Number(investAmount))} recorded.`);
      setInvestModal(null);
      setInvestAmount("");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Investment failed.");
    } finally { setInvesting(null); }
  };

  return (
    <DashboardLayout>
      <PageTitle
        greeting={greeting}
        name={`${user?.firstName ?? ""}, your investment portfolio.`}
        sub="Track your contributions to Eleje Legacy's programmes across Nigeria."
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="Total Invested"  value={naira(totalInvested)} sub="across all programmes"                                    icon={<Icons.Portfolio />} accent="var(--emerald)" />
            <StatCard label="Projects Backed" value={uniqueProjects}       sub={`${investments.length} total positions`}                  icon={<Icons.Projects />}  accent="var(--mid)" />
            <StatCard label="Average Position" value={naira(avgInvestment)} sub="per investment"                                          icon={<Icons.Trend />}     accent="var(--gold)" />
            <StatCard label="Largest Stake"   value={topProject ? naira(topProject.amount) : "—"} sub={topProject?.project?.title?.slice(0, 22) ?? "No investments yet"} icon={<Icons.Globe />} accent="var(--glow)" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 32 }} className="grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <SectionHeader label="History" title="My Investments" />
              {investments.length === 0 ? (
                <EmptyState icon={<Icons.Portfolio />} title="No investments yet" sub="Browse active projects below and make your first contribution." />
              ) : (
                <DataTable
                  columns={[
                    { key: "project",   label: "Project", render: (r: any) => <div><div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>{r.project?.title ?? "—"}</div><StatusBadge status={r.project?.status ?? "ACTIVE"} /></div> },
                    { key: "amount",    label: "Amount",  align: "right" as const, render: (r: any) => <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--emerald)" }}>{naira(r.amount)}</span> },
                    { key: "createdAt", label: "Date",    render: (r: any) => <span style={{ fontSize: "0.75rem", color: "var(--mgrey)" }}>{fmtDate(r.createdAt)}</span> },
                    { key: "actions",   label: "",        render: (r: any) => (
                      <button onClick={async () => {
                        if (!confirm("Cancel this investment?")) return;
                        try { await axiosPrivate.delete(`/api/investor/investments/${r.id}`); toast.success("Investment cancelled."); load(); }
                        catch { toast.error("Failed to cancel."); }
                      }} style={{ fontSize: "0.62rem", color: "#dc2626", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>Cancel</button>
                    )},
                  ]}
                  rows={investments}
                  empty="No investments yet."
                />
              )}
            </div>

            <div>
              <SectionHeader label="Breakdown" title="By Project" />
              <Panel style={{ height: "fit-content" }}>
                {investments.length === 0 ? (
                  <p style={{ textAlign: "center", color: "var(--mgrey)", fontSize: "0.82rem", padding: "20px 0" }}>No data to display.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {(Array.from(
                      investments.reduce((acc, i) => {
                        const key = i.project?.title ?? "Unknown";
                        acc.set(key, (acc.get(key) ?? 0) + Number(i.amount));
                        return acc;
                      }, new Map<string, number>())
                    ) as [string, number][])
                    .map(([title, amount], idx) => {
                      const pct    = totalInvested > 0 ? (amount / totalInvested) * 100 : 0;
                      const colors = ["var(--emerald)", "var(--gold)", "var(--glow)", "var(--mid)", "#8B5CF6"];
                      return (
                        <div key={title}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: "0.78rem", color: "var(--deep)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "65%" }}>{title}</span>
                            <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--deep)" }}>{naira(amount)}</span>
                          </div>
                          <ProgressBar pct={pct} color={colors[idx % colors.length]} />
                          <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>{pct.toFixed(1)}% of portfolio</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Panel>
            </div>
          </div>

          <div>
            <SectionHeader label="Explore" title="Active Projects" />
            {projects.length === 0 ? (
              <EmptyState icon={<Icons.Projects />} title="No active projects" sub="Check back soon for new opportunities." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {projects.map(p => (
                  <InvestableProjectCard key={p.id} project={p} onInvest={() => { setInvestModal(p); setInvestAmount(""); }} alreadyInvested={investments.some(i => i.projectId === p.id)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {investModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setInvestModal(null)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(6,78,56,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 4, borderRadius: "99px 99px 0 0", marginTop: -32, marginLeft: -32, marginRight: -32, marginBottom: 28, background: "linear-gradient(90deg, var(--emerald), var(--glow))" }} />
            <div className="eyebrow" style={{ marginBottom: 6 }}><div className="ey-dash" /><span className="ey-txt">New Investment</span></div>
            <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--deep)", marginBottom: 6, lineHeight: 1.2 }}>{investModal.title}</h2>
            <p style={{ fontSize: "0.78rem", color: "var(--grey)", marginBottom: 24, fontFamily: "var(--font-lora), Georgia, serif", lineHeight: 1.7 }}>{investModal.description?.slice(0, 120)}…</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
              {[10000, 50000, 100000, 250000].map(amt => (
                <button key={amt} onClick={() => setInvestAmount(String(amt))} className="abtn" style={{ borderColor: investAmount === String(amt) ? "var(--mid)" : undefined, background: investAmount === String(amt) ? "var(--deep)" : undefined }}>
                  <span className="av" style={{ color: investAmount === String(amt) ? "var(--pale)" : undefined }}>{naira(amt)}</span>
                </button>
              ))}
            </div>
            <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>Custom Amount (₦)</label>
            <input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} placeholder="Enter amount in Naira" style={{ width: "100%", padding: "11px 14px", borderRadius: 8, marginBottom: 24, border: "1px solid var(--border)", background: "var(--warm)", fontSize: "0.9rem", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif", outline: "none" }} />
            <div style={{ display: "flex", gap: 12 }}>
              <ActionButton onClick={handleInvest} disabled={!!investing}>{investing ? <><Spinner /> Processing…</> : `Invest ${investAmount ? naira(Number(investAmount)) : ""}`}</ActionButton>
              <ActionButton variant="ghost" onClick={() => setInvestModal(null)}>Cancel</ActionButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function InvestableProjectCard({ project: p, onInvest, alreadyInvested }: { project: any; onInvest: () => void; alreadyInvested: boolean }) {
  const pct = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.currentAmount) / Number(p.goalAmount)) * 100)) : 0;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px var(--shadow)", display: "flex", flexDirection: "column", gap: 12, position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(6,78,56,0.13)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px var(--shadow)"; }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, var(--emerald), var(--glow))" }} />
      {alreadyInvested && <div style={{ position: "absolute", top: 12, right: 12, fontSize: "0.54rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mid)", background: "rgba(16,185,129,0.1)", padding: "3px 8px", borderRadius: 4 }}>✓ Invested</div>}
      <div>
        <StatusBadge status={p.status} />
        <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--deep)", marginTop: 8, lineHeight: 1.25, paddingRight: alreadyInvested ? 60 : 0 }}>{p.title}</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--grey)", marginTop: 6, lineHeight: 1.6, fontFamily: "var(--font-lora), Georgia, serif", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.7rem", color: "var(--grey)" }}>{naira(p.currentAmount)} raised</span>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>Goal: {naira(p.goalAmount)}</span>
          <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>{p._count?.donations ?? 0} donors</span>
        </div>
      </div>
      <button onClick={onInvest} style={{ padding: "10px", borderRadius: 8, cursor: "pointer", background: alreadyInvested ? "var(--warm2)" : "var(--deep)", border: alreadyInvested ? "1px solid var(--border)" : "none", color: alreadyInvested ? "var(--emerald)" : "var(--cream)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jost), sans-serif", transition: "opacity 0.18s" }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
        {alreadyInvested ? "+ Invest More" : "Invest in This Project"}
      </button>
    </div>
  );
}