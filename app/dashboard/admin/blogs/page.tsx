"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, ActionButton, Panel,
  StatusBadge, LoadingDots, EmptyState, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
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

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminBlogsPage() {
  const [blogs, setBlogs]     = useState<Blog[]>([]);
  const [meta, setMeta]       = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [pubFilter, setPub]   = useState<"" | "true" | "false">("");
  const [modal, setModal]     = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Blog | null>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search)           p.set("search", search);
      if (pubFilter !== "") p.set("published", pubFilter);
      const { data } = await axiosPrivate.get(`/api/blogs?${p}`);
      setBlogs(data.data); setMeta(data.meta);
    } catch { toast.error("Failed to load blog posts."); }
    finally { setLoading(false); }
  }, [search, pubFilter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setSelected(null); setModal("create"); };
  const openEdit   = (b: Blog) => { setSelected(b); setModal("edit"); };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await axiosPrivate.delete(`/api/staff/blogs/${id}`);
      toast.success("Post deleted."); load();
    } catch { toast.error("Delete failed."); }
  };

  const handleTogglePublish = async (b: Blog) => {
    try {
      await axiosPrivate.patch(`/api/staff/blogs/${b.id}`, { isPublished: !b.isPublished });
      toast.success(b.isPublished ? "Post unpublished." : "Post published!"); load();
    } catch { toast.error("Update failed."); }
  };

  const cols = [
    {
      key: "title", label: "Post",
      render: (b: Blog) => (
        <div>
          <div style={{ fontWeight: 500, color: "var(--deep)", fontSize: "0.85rem", marginBottom: 2 }}>{b.title}</div>
          {b.excerpt && (
            <div style={{ fontSize: "0.7rem", color: "var(--mgrey)", overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
              {b.excerpt}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "author", label: "Author",
      render: (b: Blog) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--deep), var(--emerald))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.68rem", fontWeight: 700, color: "var(--pale)" }}>
            {b.author?.firstName?.[0]}{b.author?.lastName?.[0]}
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>
            {b.author?.firstName} {b.author?.lastName}
          </span>
        </div>
      ),
    },
    {
      key: "isPublished", label: "Status",
      render: (b: Blog) => <StatusBadge status={b.isPublished ? "PUBLISHED" : "DRAFT"} />,
    },
    {
      key: "publishedAt", label: "Published",
      render: (b: Blog) => <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>{fmtDate(b.publishedAt)}</span>,
    },
    {
      key: "updatedAt", label: "Updated",
      render: (b: Blog) => <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>{fmtDate(b.updatedAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (b: Blog) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => handleTogglePublish(b)}
            style={{ ...mBtnBase, background: b.isPublished ? "rgba(201,168,76,0.1)" : "rgba(16,185,129,0.1)",
              color: b.isPublished ? "var(--gold)" : "var(--mid)",
              border: `1px solid ${b.isPublished ? "rgba(201,168,76,0.3)" : "rgba(16,185,129,0.3)"}` }}>
            {b.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button onClick={() => openEdit(b)} style={{ ...mBtnBase, background: "rgba(201,168,76,0.1)",
            color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)" }}>Edit</button>
          <button onClick={() => handleDelete(b.id, b.title)}
            style={{ ...mBtnBase, background: "rgba(220,38,38,0.07)", color: "#dc2626",
              border: "1px solid rgba(220,38,38,0.2)" }}>Del</button>
        </div>
      ),
    },
  ];

  const published = blogs.filter(b => b.isPublished).length;
  const drafts    = blogs.length - published;

  return (
    <DashboardLayout>
      <SectionHeader
        label="Admin"
        title="Blog Posts"
        action={<ActionButton onClick={openCreate}>+ New Post</ActionButton>}
      />

      {/* Stats strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Posts",  value: meta.total,   color: "var(--deep)" },
          { label: "Published",    value: published,    color: "var(--mid)" },
          { label: "Drafts",       value: drafts,       color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 20px", minWidth: 120, flex: "1 1 120px" }}>
            <div style={{ fontSize: "0.56rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--mgrey)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.6rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts…" style={{ ...inputStyle, maxWidth: 280 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {(["", "true", "false"] as const).map(f => (
              <button key={f} onClick={() => setPub(f)} style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase",
                border: "none", fontFamily: "var(--font-jost), sans-serif",
                background: pubFilter === f ? "var(--deep)" : "var(--warm2)",
                color: pubFilter === f ? "var(--cream)" : "var(--grey)",
              }}>
                {f === "" ? "All" : f === "true" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : blogs.length === 0 ? (
        <EmptyState title="No posts found" sub="Create a new blog post to get started."
          action={<ActionButton onClick={openCreate}>+ Write a Post</ActionButton>} />
      ) : (
        <>
          {/* Card grid for visual scanning */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 16, marginBottom: 28 }}>
            {blogs.map(b => <BlogCard key={b.id} blog={b} onEdit={() => openEdit(b)}
              onToggle={() => handleTogglePublish(b)} onDelete={() => handleDelete(b.id, b.title)} />)}
          </div>
        </>
      )}

      <Pagination meta={meta} onPage={load} />

      {(modal === "create" || modal === "edit") && (
        <BlogFormModal blog={modal === "edit" ? selected : null}
          onClose={() => { setModal(null); load(); }} />
      )}
    </DashboardLayout>
  );
}

/* ── Blog Card ── */
function BlogCard({ blog: b, onEdit, onToggle, onDelete }: { blog: Blog; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 16,
      overflow: "hidden", boxShadow: "0 2px 12px var(--shadow)",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s" }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(6,78,56,0.13)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px var(--shadow)"; }}
    >
      {/* Cover or gradient */}
      <div style={{ height: 110, flexShrink: 0, position: "relative",
        background: b.coverImage
          ? `url(${b.coverImage}) center/cover`
          : `linear-gradient(135deg, var(--ink) 0%, var(--deep) 60%, var(--emerald) 100%)` }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,14,10,0.5), transparent)" }} />
        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <StatusBadge status={b.isPublished ? "PUBLISHED" : "DRAFT"} />
        </div>
        <div style={{ position: "absolute", bottom: 10, right: 12,
          fontSize: "0.62rem", color: "rgba(255,255,255,0.65)" }}>
          {fmtDate(b.publishedAt ?? b.createdAt)}
        </div>
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--deep), var(--emerald))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.58rem", fontWeight: 700, color: "var(--pale)", flexShrink: 0 }}>
            {b.author?.firstName?.[0]}{b.author?.lastName?.[0]}
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>
            {b.author?.firstName} {b.author?.lastName}
          </span>
        </div>

        <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.05rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {b.title}
        </h3>

        {b.excerpt && (
          <p style={{ fontSize: "0.72rem", color: "var(--grey)", lineHeight: 1.6,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {b.excerpt}
          </p>
        )}

        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button onClick={onEdit} style={{ ...mBtnBase, flex: 1, background: "var(--warm2)", color: "var(--deep)", border: "1px solid var(--border)" }}>Edit</button>
          <button onClick={onToggle} style={{ ...mBtnBase, flex: 1, background: b.isPublished ? "rgba(201,168,76,0.1)" : "rgba(16,185,129,0.1)",
            color: b.isPublished ? "var(--gold)" : "var(--mid)", border: "none" }}>
            {b.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button onClick={onDelete} style={{ ...mBtnBase, width: 34, padding: 0, background: "rgba(220,38,38,0.07)", color: "#dc2626", border: "none" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

/* ── Blog Form Modal ── */
function BlogFormModal({ blog, onClose }: { blog: Blog | null; onClose: () => void }) {
  const axiosPrivate = useAxiosPrivate()
  const isEdit = !!blog;
  const [form, setForm] = useState({
    title:       blog?.title       ?? "",
    excerpt:     blog?.excerpt     ?? "",
    content:     blog?.content     ?? "",
    coverImage:  blog?.coverImage  ?? "",
    isPublished: blog?.isPublished ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.warning("Title and content are required."); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await axiosPrivate.patch(`/api/staff/blogs/${blog!.id}`, form);
        toast.success("Post updated.");
      } else {
        await axiosPrivate.post("/api/staff/blogs", form);
        toast.success("Post created.");
      }
      onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} maxWidth={640}>
      <ModalTitle>{isEdit ? "Edit Post" : "New Blog Post"}</ModalTitle>

      <FormField label="Title">
        <input value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="Post title" style={inputStyle} />
      </FormField>

      <FormField label="Excerpt (optional)">
        <input value={form.excerpt} onChange={e => set("excerpt", e.target.value)}
          placeholder="Short description shown in listings" style={inputStyle} />
      </FormField>

      <FormField label="Content (Markdown)">
        <textarea value={form.content} onChange={e => set("content", e.target.value)}
          placeholder="Write your post content here…" rows={10}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7, fontSize: "0.82rem" }} />
      </FormField>

      <FormField label="Cover Image URL">
        <input value={form.coverImage} onChange={e => set("coverImage", e.target.value)}
          placeholder="https://res.cloudinary.com/…" style={inputStyle} />
      </FormField>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Toggle value={form.isPublished} onChange={v => set("isPublished", v)} />
        <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>
          {form.isPublished ? "Publish immediately" : "Save as draft"}
        </span>
      </div>

      <ModalActions>
        <ActionButton onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner /> Saving…</> : isEdit ? "Save Changes" : "Create Post"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
      </ModalActions>
    </Modal>
  );
}

/* ── Shared ── */
const mBtnBase: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 7, cursor: "pointer",
  fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase",
  fontFamily: "var(--font-jost), sans-serif", fontWeight: 600,
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 42, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
      background: value ? "var(--mid)" : "var(--border)", position: "relative", flexShrink: 0, transition: "background 0.2s",
    }}>
      <span style={{ position: "absolute", top: 2, left: value ? "calc(100% - 22px)" : 2,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}

function Modal({ children, onClose, maxWidth = 480 }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6,14,10,0.6)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32,
        width: "100%", maxWidth, boxShadow: "0 24px 80px rgba(6,78,56,0.22)",
        maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
function ModalTitle({ children }: any) {
  return <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.7rem", fontWeight: 700, color: "var(--deep)", marginBottom: 20, lineHeight: 1.2 }}>{children}</h2>;
}
function FormField({ label, children }: any) {
  return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>{label}</label>{children}</div>;
}
function ModalActions({ children, style }: any) {
  return <div style={{ display: "flex", gap: 10, flexWrap: "wrap", ...style }}>{children}</div>;
}
function Pagination({ meta, onPage }: any) {
  if (meta.totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
      {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} style={{
          width: 34, height: 34, borderRadius: 8, cursor: "pointer",
          border: "1px solid var(--border)",
          background: p === meta.page ? "var(--deep)" : "var(--warm)",
          color: p === meta.page ? "var(--cream)" : "var(--grey)", fontSize: "0.78rem",
        }}>{p}</button>
      ))}
    </div>
  );
}