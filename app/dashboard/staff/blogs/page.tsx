"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, ActionButton, Panel, StatusBadge,
  LoadingDots, EmptyState, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

interface Blog {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; coverImage: string | null; isPublished: boolean;
  publishedAt: string | null; createdAt: string; updatedAt: string;
  author: { firstName: string; lastName: string };
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

export default function StaffBlogsPage() {
  const axiosPrivate = useAxiosPrivate();

  const [blogs,    setBlogs]    = useState<Blog[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Blog | null>(null);
  const [filter,   setFilter]   = useState<"all" | "published" | "drafts">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosPrivate.get("/api/staff/blogs?limit=100");
      setBlogs(data.data ?? []);
    } catch {
      toast.error("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  // FIX — remove loadingUser/email guard; /api/staff/blogs is server-scoped by
  // JWT sub. Fires immediately like investor pages — interceptor handles any 401.
  useEffect(() => { load(); }, [load]);

  const handleToggle = async (b: Blog) => {
    try {
      await axiosPrivate.patch(`/api/staff/blogs/${b.id}`, { isPublished: !b.isPublished });
      toast.success(b.isPublished ? "Draft saved." : "Published!");
      load();
    } catch { toast.error("Update failed."); }
  };

  const handleDelete = async (b: Blog) => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    try {
      await axiosPrivate.delete(`/api/staff/blogs/${b.id}`);
      toast.success("Post deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  const displayed = blogs.filter(b => {
    if (filter === "published") return b.isPublished;
    if (filter === "drafts")    return !b.isPublished;
    return true;
  });
  const published = blogs.filter(b => b.isPublished).length;
  const drafts    = blogs.filter(b => !b.isPublished).length;

  return (
    <DashboardLayout>
      <SectionHeader
        label="My Content"
        title="My Blog Posts"
        action={<ActionButton onClick={() => { setSelected(null); setModal("create"); }}>+ Write Post</ActionButton>}
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total Posts", value: String(blogs.length), color: "var(--deep)" },
          { label: "Published",   value: String(published),    color: "var(--mid)" },
          { label: "Drafts",      value: String(drafts),       color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 18px", flex: "1 1 100px" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <Panel style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "published", "drafts"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 18px", borderRadius: 20, cursor: "pointer", border: "none",
              fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase",
              fontFamily: "var(--font-jost), sans-serif",
              background: filter === f ? "var(--deep)" : "var(--warm2)",
              color: filter === f ? "var(--cream)" : "var(--grey)",
            }}>
              {f === "all" ? `All (${blogs.length})` : f === "published" ? `Published (${published})` : `Drafts (${drafts})`}
            </button>
          ))}
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : displayed.length === 0 ? (
        <EmptyState
          title={filter === "all" ? "No posts yet" : `No ${filter} posts`}
          sub={filter === "all" ? "Share your knowledge with the Eleje community." : undefined}
          action={filter === "all" ? <ActionButton onClick={() => setModal("create")}>Write Your First Post</ActionButton> : undefined}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {displayed.map(b => (
            <BlogListItem
              key={b.id}
              blog={b}
              onEdit={() => { setSelected(b); setModal("edit"); }}
              onToggle={() => handleToggle(b)}
              onDelete={() => handleDelete(b)}
            />
          ))}
        </div>
      )}

      {(modal === "create" || modal === "edit") && (
        <StaffBlogFormModal
          blog={modal === "edit" ? selected : null}
          axiosPrivate={axiosPrivate}
          onClose={() => { setModal(null); load(); }}
        />
      )}
    </DashboardLayout>
  );
}

/* ── Blog List Item ── */
function BlogListItem({ blog: b, onEdit, onToggle, onDelete }: {
  blog: Blog; onEdit: () => void; onToggle: () => void; onDelete: () => void;
}) {
  const actionBtn = (color: string): React.CSSProperties => ({
    padding: "6px 12px", borderRadius: 7, cursor: "pointer",
    fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase",
    background: `${color}14`, color, border: `1px solid ${color}30`,
    fontFamily: "var(--font-jost), sans-serif", fontWeight: 600,
  });

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16,
      overflow: "hidden", boxShadow: "0 2px 10px var(--shadow)",
      display: "grid", gridTemplateColumns: "auto 1fr" }}
    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 28px rgba(6,78,56,0.12)")}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 10px var(--shadow)")}>
      <div style={{ width: 5, background: b.isPublished
        ? "linear-gradient(180deg, var(--emerald), var(--glow))"
        : "linear-gradient(180deg, var(--border), var(--mgrey))" }} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
              <StatusBadge status={b.isPublished ? "PUBLISHED" : "DRAFT"} />
              {b.publishedAt && <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>{fmtDate(b.publishedAt)}</span>}
            </div>
            <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.25, marginBottom: 6 }}>{b.title}</h3>
            {b.excerpt && <p style={{ fontSize: "0.75rem", color: "var(--grey)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.excerpt}</p>}
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>Created {fmtDate(b.createdAt)}</span>
              <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>Updated {fmtDate(b.updatedAt)}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", alignSelf: "flex-start" }}>
            <button onClick={onEdit}   style={actionBtn("var(--gold)")}>Edit</button>
            <button onClick={onToggle} style={actionBtn(b.isPublished ? "var(--mgrey)" : "var(--mid)")}>{b.isPublished ? "Unpublish" : "Publish"}</button>
            <button onClick={onDelete} style={actionBtn("#dc2626")}>Delete</button>
          </div>
        </div>
        <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--warm)", borderRadius: 8, display: "inline-flex", gap: 16 }}>
          <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>~{Math.round((b?.content?.split(/\s+/).length ?? 0))} words</span>
          <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>~{Math.ceil((b?.content?.split(/\s+/).length ?? 0) / 200)} min read</span>
        </div>
      </div>
    </div>
  );
}

/* ── Blog Form Modal ── */
function StaffBlogFormModal({ blog, onClose, axiosPrivate }: {
  blog: Blog | null; onClose: () => void;
  axiosPrivate: ReturnType<typeof useAxiosPrivate>;
}) {
  const isEdit = !!blog;
  const [form, setForm] = useState({
    title:       blog?.title       ?? "",
    excerpt:     blog?.excerpt     ?? "",
    content:     blog?.content     ?? "",
    coverImage:  blog?.coverImage  ?? "",
    isPublished: blog?.isPublished ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [tab,    setTab]    = useState<"write" | "preview">("write");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (publish?: boolean) => {
    if (!form.title || !form.content) { toast.warning("Title and content are required."); return; }
    setSaving(true);
    const payload = { ...form, isPublished: publish ?? form.isPublished };
    try {
      if (isEdit) {
        await axiosPrivate.patch(`/api/staff/blogs/${blog!.id}`, payload);
        toast.success("Post updated.");
      } else {
        await axiosPrivate.post("/api/staff/blogs", payload);
        toast.success(payload.isPublished ? "Post published!" : "Draft saved.");
      }
      onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Save failed."); }
    finally { setSaving(false); }
  };

  const wordCount  = form.content.split(/\s+/).filter(Boolean).length;
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.62rem", letterSpacing: "0.18em",
    textTransform: "uppercase", color: "var(--grey)", marginBottom: 6,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.65)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 740, boxShadow: "0 24px 80px rgba(6,78,56,0.22)", maxHeight: "95vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1 }}>
            {isEdit ? "Edit Post" : "New Blog Post"}
          </h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["write", "preview"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 14px", borderRadius: 20, cursor: "pointer", border: "none", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--font-jost), sans-serif", background: tab === t ? "var(--deep)" : "var(--warm2)", color: tab === t ? "var(--cream)" : "var(--grey)" }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div style={{ marginBottom: 16 }}><label style={labelStyle}>Title</label><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Your post title" style={{ ...inputStyle, fontSize: "1rem" }} /></div>
          <div style={{ marginBottom: 16 }}><label style={labelStyle}>Excerpt</label><input value={form.excerpt} onChange={e => set("excerpt", e.target.value)} placeholder="Short summary shown in listings" style={inputStyle} /></div>
          {tab === "write" ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={labelStyle}>Content (Markdown)</label>
                <span style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}>{wordCount} words · ~{Math.ceil(wordCount / 200)} min read</span>
              </div>
              <textarea value={form.content} onChange={e => set("content", e.target.value)} placeholder="Write your story here… Markdown is supported." style={{ ...inputStyle, minHeight: 280, resize: "vertical", lineHeight: 1.8, fontSize: "0.85rem", fontFamily: "monospace" }} />
            </div>
          ) : (
            <div style={{ marginBottom: 16, padding: "16px 20px", background: "var(--warm)", borderRadius: 10, border: "1px solid var(--border)", minHeight: 280 }}>
              <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--deep)", marginBottom: 12 }}>{form.title || "Preview Title"}</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--grey)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{form.content || "Your content will appear here…"}</p>
            </div>
          )}
          <div style={{ marginBottom: 16 }}><label style={labelStyle}>Cover Image URL</label><input value={form.coverImage} onChange={e => set("coverImage", e.target.value)} placeholder="https://res.cloudinary.com/…" style={inputStyle} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Toggle value={form.isPublished} onChange={v => set("isPublished", v)} />
            <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>{form.isPublished ? "Will be published immediately" : "Save as draft"}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <ActionButton onClick={() => handleSave()} disabled={saving}>
            {saving ? <><Spinner /> Saving…</> : form.isPublished ? "Publish" : "Save Draft"}
          </ActionButton>
          {!form.isPublished && <ActionButton variant="ghost" onClick={() => handleSave(true)} disabled={saving}>Publish Now</ActionButton>}
          <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: value ? "var(--mid)" : "var(--border)", position: "relative", flexShrink: 0, transition: "background 0.2s" }}><span style={{ position: "absolute", top: 2, left: value ? "calc(100% - 22px)" : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} /></button>;
}