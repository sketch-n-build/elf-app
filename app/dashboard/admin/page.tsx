"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
// import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  StatCard, SectionHeader, DataTable, ProgressBar,
  StatusBadge, ActionButton, PageTitle, Panel,
  LoadingDots, naira, fmtDate,
} from "../../components/dashboard/DashboardUI";
import { useUserStore } from "@/app/store/useUserStore";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

/* ── Icon helpers ── */
const Icons = {
  Naira:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>,
  Projects: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/><path d="M2 10h20"/></svg>,
  Users:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Blog:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  Campaign: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Invest:   () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>,
};

export default function AdminDashboardPage() {
  const { user } = useUserStore();
  const axiosPrivate = useAxiosPrivate();
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const load = useCallback(async () => {
    try {
      const { data } = await axiosPrivate.get("/api/dashboard");
      setStats(data.data);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const topProjects = stats?.projects?.top5 ?? [];
  const recentDonations = stats?.recentActivity?.donations ?? [];
  const recentBlogs = stats?.recentActivity?.blogs ?? [];
  const byRole = stats?.users?.byRole ?? {};

  return (
    <DashboardLayout>
      <PageTitle
        greeting={greeting}
        name={`${user?.firstName ?? ""}, here's your overview.`}
        sub="Full organisation-wide snapshot across all programmes and contributors."
      />

      {/* ── Primary KPI row ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard
              label="Total Raised"
              value={naira(stats?.donations?.totalRaisedNaira ?? 0)}
              sub={`${stats?.donations?.successful ?? 0} successful donations`}
              icon={<Icons.Naira />}
              accent="var(--emerald)"
              trend={{ value: naira(stats?.donations?.last30Days?.raisedNaira ?? 0) + " this month", up: true }}
            />
            <StatCard
              label="Active Projects"
              value={stats?.projects?.active ?? 0}
              sub={`${stats?.projects?.completed ?? 0} completed`}
              icon={<Icons.Projects />}
              accent="var(--mid)"
            />
            <StatCard
              label="Total Users"
              value={stats?.users?.total ?? 0}
              sub={`${byRole.STAFF ?? 0} staff · ${byRole.INVESTOR ?? 0} investors`}
              icon={<Icons.Users />}
              accent="var(--gold)"
            />
            <StatCard
              label="Blog Posts"
              value={stats?.blogs?.published ?? 0}
              sub={`${stats?.blogs?.drafts ?? 0} drafts pending`}
              icon={<Icons.Blog />}
              accent="var(--deep)"
            />
            <StatCard
              label="Campaigns"
              value={stats?.campaigns?.active ?? 0}
              sub={`${naira(stats?.campaigns?.totalRaisedNaira ?? 0)} raised`}
              icon={<Icons.Campaign />}
              accent="#8B5CF6"
            />
            <StatCard
              label="Investments"
              value={naira(stats?.investments?.totalNaira ?? 0)}
              sub={`${stats?.investments?.total ?? 0} total investments`}
              icon={<Icons.Invest />}
              accent="var(--glow)"
            />
          </div>

          {/* ── 30-day donation sparkline ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}
            className="grid-cols-1 lg:grid-cols-2">

            {/* Donation trend chart */}
            <Panel>
              <SectionHeader label="Last 30 Days" title="Donation Trend" />
              <DonationSparkline data={stats?.donations?.dailyBreakdown ?? []} />
            </Panel>

            {/* User breakdown */}
            <Panel>
              <SectionHeader label="Platform" title="User Breakdown" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
                {[
                  { role: "ADMIN",    count: byRole.ADMIN    ?? 0, color: "var(--gold)",    pct: 100 },
                  { role: "STAFF",    count: byRole.STAFF    ?? 0, color: "var(--mid)",     pct: Math.round(((byRole.STAFF ?? 0) / Math.max(1, stats?.users?.total)) * 100) },
                  { role: "INVESTOR", count: byRole.INVESTOR ?? 0, color: "var(--glow)",    pct: Math.round(((byRole.INVESTOR ?? 0) / Math.max(1, stats?.users?.total)) * 100) },
                ].map(r => (
                  <div key={r.role}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <StatusBadge status={r.role} />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--deep)",
                        fontFamily: "var(--font-cormorant), Georgia, serif" }}>
                        {r.count}
                      </span>
                    </div>
                    <ProgressBar pct={r.pct} color={r.color} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* ── Top projects ── */}
          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              label="Fundraising"
              title="Top Projects by Funds Raised"
              action={<Link href="/dashboard/admin/projects"><ActionButton variant="ghost" size="sm">View All →</ActionButton></Link>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {topProjects.map((p: any, i: number) => (
                <ProjectCard key={p.id} project={p} rank={i + 1} />
              ))}
              {topProjects.length === 0 && (
                <div style={{ gridColumn: "1/-1", padding: "32px", textAlign: "center",
                  background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
                  color: "var(--mgrey)", fontSize: "0.82rem" }}>
                  No projects found. <Link href="/dashboard/admin/projects" style={{ color: "var(--emerald)" }}>Create one →</Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Recent donations + recent blogs ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}
            className="grid-cols-1 lg:grid-cols-[1.4fr_1fr]">

            <div>
              <SectionHeader
                label="Activity"
                title="Recent Donations"
                action={<Link href="/dashboard/admin/donations"><ActionButton variant="ghost" size="sm">All Donations →</ActionButton></Link>}
              />
              <DataTable
                columns={[
                  { key: "donorName",   label: "Donor" },
                  { key: "amount",      label: "Amount",  align: "right",
                    render: r => <span style={{ fontWeight: 600, color: "var(--emerald)" }}>{naira(r.amount)}</span> },
                  { key: "projectTitle", label: "Project",
                    render: r => r.projectTitle
                      ? <span style={{ color: "var(--mid)", fontSize: "0.78rem" }}>{r.projectTitle}</span>
                      : <span style={{ color: "var(--mgrey)" }}>—</span> },
                  { key: "paidAt", label: "Date",
                    render: r => <span style={{ color: "var(--mgrey)", fontSize: "0.75rem" }}>{fmtDate(r.paidAt)}</span> },
                ]}
                rows={recentDonations}
                empty="No donations yet."
              />
            </div>

            <div>
              <SectionHeader
                label="Content"
                title="Recent Posts"
                action={<Link href="/dashboard/admin/blogs"><ActionButton variant="ghost" size="sm">All Posts →</ActionButton></Link>}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentBlogs.length === 0 && (
                  <Panel><p style={{ color: "var(--mgrey)", fontSize: "0.82rem", textAlign: "center", padding: "16px 0" }}>No posts published yet.</p></Panel>
                )}
                {recentBlogs.map((b: any) => (
                  <div key={b.id} style={{
                    background: "#fff", border: "1px solid var(--border)",
                    borderRadius: 12, padding: "14px 16px",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", gap: 12,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        marginBottom: 4 }}>
                        {b.title}
                      </p>
                      <p style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>
                        {b.author?.firstName} {b.author?.lastName} · {fmtDate(b.publishedAt)}
                      </p>
                    </div>
                    <Link href={`/dashboard/admin/blogs`}>
                      <span style={{ fontSize: "0.62rem", color: "var(--mid)", whiteSpace: "nowrap" }}>Edit →</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick actions ── */}
          <Panel style={{ marginTop: 32 }}>
            <SectionHeader label="Admin" title="Quick Actions" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[
                { label: "+ New Project",   href: "/dashboard/admin/projects?action=new" },
                { label: "+ New Blog Post", href: "/dashboard/admin/blogs?action=new" },
                { label: "+ New Campaign",  href: "/dashboard/admin/campaigns?action=new" },
                { label: "+ Invite User",   href: "/dashboard/admin/users?action=new" },
                { label: "View All Donors", href: "/dashboard/admin/donors" },
              ].map(a => (
                <Link key={a.href} href={a.href}>
                  <ActionButton>{a.label}</ActionButton>
                </Link>
              ))}
            </div>
          </Panel>
        </>
      )}
    </DashboardLayout>
  );
}

/* ── Sub-components ── */

function ProjectCard({ project: p, rank }: { project: any; rank: number }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 16,
      padding: "18px 20px", position: "relative", overflow: "hidden",
      boxShadow: "0 2px 12px var(--shadow)",
    }}>
      <div style={{
        position: "absolute", top: 14, right: 16,
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "3rem", fontWeight: 700, color: "var(--warm2)",
        lineHeight: 1, userSelect: "none",
      }}>
        #{rank}
      </div>
      <StatusBadge status={p.status} />
      <h3 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "1.1rem", fontWeight: 700, color: "var(--deep)",
        marginTop: 10, marginBottom: 6, lineHeight: 1.25,
        paddingRight: 32,
      }}>
        {p.title}
      </h3>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: "0.7rem", color: "var(--grey)" }}>
          {naira(p.currentAmount)} raised
        </span>
        <span style={{ fontSize: "0.7rem", color: "var(--mgrey)" }}>
          of {naira(p.goalAmount)}
        </span>
      </div>
      <ProgressBar pct={p.progressPct} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--emerald)" }}>
          {p.progressPct}% funded
        </span>
        <span style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>
          {p._count?.donations ?? 0} donations
        </span>
      </div>
    </div>
  );
}

function DonationSparkline({ data }: { data: Array<{ day: string; total: number }> }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 120, display: "flex", alignItems: "center",
        justifyContent: "center", color: "var(--mgrey)", fontSize: "0.8rem" }}>
        No donation data yet.
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.total), 1);
  const w = 100 / data.length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 100 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (d.total / max) * 100);
          return (
            <div key={i} style={{ flex: 1, position: "relative" }} title={`${fmtDate(d.day)}: ${naira(d.total)}`}>
              <div style={{
                height: `${h}%`, borderRadius: "3px 3px 0 0",
                background: `linear-gradient(180deg, var(--mid), var(--glow))`,
                opacity: 0.8, transition: "opacity 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>
          {data[0] ? fmtDate(data[0].day) : ""}
        </span>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--emerald)" }}>
          {naira(data.reduce((sum, d) => sum + d.total, 0))} total
        </span>
        <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>
          {data[data.length - 1] ? fmtDate(data[data.length - 1].day) : ""}
        </span>
      </div>
    </div>
  );
}