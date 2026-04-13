"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  StatCard, SectionHeader, DataTable, ActionButton,
  Panel, PageTitle, LoadingDots, ProgressBar,
  StatusBadge, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import { useUserStore } from "@/app/store/useUserStore";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";
import { toast } from "react-toastify";

const Icons = {
  Projects: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/><path d="M2 10h20"/></svg>,
  Blog:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
  Draft:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

export default function StaffDashboardPage() {
  const { user, loadingUser } = useUserStore();
  const axiosPrivate = useAxiosPrivate();
  const [projects, setProjects] = useState<any[]>([]);
  const [blogs, setBlogs]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // ✅ API is now scoped server-side by role — no client-side email filter needed
  const load = useCallback(async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        axiosPrivate.get("/api/staff/projects?limit=100"),
        axiosPrivate.get("/api/staff/blogs?limit=100"),
      ]);
      setProjects(pRes.data.data ?? []);
      setBlogs(bRes.data.data ?? []);
    } catch {
      toast.error("Failed to load your content.");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  // ✅ Gate on loadingUser — prevents race condition on hard reload
  useEffect(() => {
    // if (loadingUser || !user?.email) return;
    load();
  }, [load]);

  const published   = blogs.filter(b => b.isPublished);
  const drafts      = blogs.filter(b => !b.isPublished);
  const active      = projects.filter(p => p.status === "ACTIVE");
  const totalRaised = projects.reduce((s, p) => s + Number(p.currentAmount), 0);

  return (
    <DashboardLayout>
      <PageTitle
        greeting={greeting}
        name={`${user?.firstName ?? "…"}, your workspace.`}
        sub="Everything you've created and published — your projects, posts, and impact."
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
            <StatCard label="My Projects"     value={projects.length}    sub={`${active.length} active`}          icon={<Icons.Projects />} accent="var(--emerald)" />
            <StatCard label="Total Raised"    value={naira(totalRaised)} sub="across all my projects"             icon={<Icons.Projects />} accent="var(--mid)" />
            <StatCard label="Published Posts" value={published.length}   sub={`${drafts.length} drafts`}          icon={<Icons.Blog />}     accent="var(--gold)" />
            <StatCard label="Draft Posts"     value={drafts.length}      sub="awaiting publication"               icon={<Icons.Draft />}    accent="var(--mgrey)" />
          </div>

          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              label="My Work"
              title="My Projects"
              action={<Link href="/dashboard/staff/projects?action=new"><ActionButton size="sm">+ New Project</ActionButton></Link>}
            />
            {projects.length === 0 ? (
              <EmptyState
                icon={<Icons.Projects />}
                title="No projects yet"
                sub="Create your first project to start tracking impact."
                action={<Link href="/dashboard/staff/projects?action=new"><ActionButton>Create Project</ActionButton></Link>}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {projects.map(p => (
                  <StaffProjectCard key={p.id} project={p} onRefresh={load} />
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 32 }}>
            <SectionHeader
              label="Content"
              title="My Blog Posts"
              action={<Link href="/dashboard/staff/blogs?action=new"><ActionButton size="sm">+ New Post</ActionButton></Link>}
            />
            {blogs.length === 0 ? (
              <EmptyState
                icon={<Icons.Blog />}
                title="No posts yet"
                sub="Share your insights with the Eleje Legacy community."
                action={<Link href="/dashboard/staff/blogs?action=new"><ActionButton>Write a Post</ActionButton></Link>}
              />
            ) : (
              <DataTable
                columns={[
                  { key: "title",       label: "Title",  render: (b: any) => <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--deep)" }}>{b.title}</span> },
                  { key: "isPublished", label: "Status", render: (b: any) => <StatusBadge status={b.isPublished ? "PUBLISHED" : "DRAFT"} /> },
                  { key: "publishedAt", label: "Date",   render: (b: any) => <span style={{ fontSize: "0.75rem", color: "var(--mgrey)" }}>{fmtDate(b.publishedAt ?? b.createdAt)}</span> },
                  { key: "actions",     label: "",       render: (b: any) => <Link href={`/dashboard/staff/blogs?edit=${b.id}`}><ActionButton size="sm" variant="ghost">Edit</ActionButton></Link> },
                ]}
                rows={blogs}
                empty="No blog posts yet."
              />
            )}
          </div>

          <Panel style={{ background: "linear-gradient(135deg, var(--deep) 0%, var(--emerald) 100%)", border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(168,230,216,0.5)", marginBottom: 6 }}>Quick Actions</div>
                <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--cream)", lineHeight: 1.3 }}>
                  Keep your projects updated<br />to engage supporters.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/dashboard/staff/projects?action=new">
                  <button style={{ padding: "10px 20px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "var(--cream)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600, fontFamily: "var(--font-jost), sans-serif" }}>+ New Project</button>
                </Link>
                <Link href="/dashboard/staff/blogs?action=new">
                  <button style={{ padding: "10px 20px", borderRadius: 8, cursor: "pointer", background: "var(--glow)", border: "none", color: "var(--ink)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, fontFamily: "var(--font-jost), sans-serif" }}>+ Write Post</button>
                </Link>
              </div>
            </div>
          </Panel>
        </>
      )}
    </DashboardLayout>
  );
}

function StaffProjectCard({ project: p, onRefresh }: { project: any; onRefresh: () => void }) {
  const axiosPrivate = useAxiosPrivate();

  const handleDelete = async () => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await axiosPrivate.delete(`/api/staff/projects/${p.id}`);
      toast.success("Project deleted.");
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to delete project.");
    }
  };

  const pct = p.goalAmount > 0
    ? Math.min(100, Math.round((Number(p.currentAmount) / Number(p.goalAmount)) * 100))
    : 0;

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16, padding: "20px", boxShadow: "0 2px 12px var(--shadow)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <StatusBadge status={p.status} />
          <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--deep)", marginTop: 8, lineHeight: 1.25 }}>{p.title}</h3>
        </div>
        {p.isFeatured && <span style={{ fontSize: "0.54rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", background: "rgba(201,168,76,0.1)", padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>Featured</span>}
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.72rem", color: "var(--grey)" }}>{naira(p.currentAmount)} raised</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--emerald)" }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} />
        <div style={{ fontSize: "0.68rem", color: "var(--mgrey)", marginTop: 5 }}>Goal: {naira(p.goalAmount)}</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <Link href={`/dashboard/staff/projects?edit=${p.id}`} style={{ flex: 1 }}><ActionButton variant="ghost" size="sm">Edit</ActionButton></Link>
        <Link href={`/dashboard/staff/projects?update=${p.id}`} style={{ flex: 1 }}><ActionButton size="sm">+ Update</ActionButton></Link>
        <button onClick={handleDelete} style={{ padding: "6px 10px", borderRadius: 8, cursor: "pointer", border: "1px solid rgba(220,38,38,0.2)", background: "transparent", color: "#dc2626", fontSize: "0.82rem" }}>✕</button>
      </div>
    </div>
  );
}