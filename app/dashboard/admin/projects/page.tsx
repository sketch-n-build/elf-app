"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, ActionButton, Panel,
  StatusBadge, LoadingDots, ProgressBar,
  EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

/* ── Types ── */
interface Project {
  id: string; title: string; slug: string; description: string;
  coverImage: string | null; goalAmount: number; currentAmount: number;
  status: string; isFeatured: boolean; createdAt: string;
  createdBy: { firstName: string; lastName: string };
  _count?: { donations: number };
}

const STATUSES = ["ACTIVE", "COMPLETED", "PAUSED"];
const BLANK: Partial<Project> & { goalAmount: number } = {
  title: "", description: "", goalAmount: 0, coverImage: "",
  status: "ACTIVE", isFeatured: false,
};

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusF, setStatusF]   = useState("");
  const [view, setView]         = useState<"grid" | "table">("grid");
  const [modal, setModal]       = useState<"create" | "edit" | "detail" | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "12" });
      if (search)  p.set("search", search);
      if (statusF) p.set("status", statusF);
      const { data } = await axiosPrivate.get(`/api/projects?${p}`);
      setProjects(data.data); setMeta(data.meta);
    } catch { toast.error("Failed to load projects."); }
    finally { setLoading(false); }
  }, [search, statusF]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setSelected(null); setModal("create"); };
  const openEdit   = (p: Project) => { setSelected(p); setModal("edit"); };
  const openDetail = (p: Project) => { setSelected(p); setModal("detail"); };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? All updates and investments will be removed.`)) return;
    try {
      await axiosPrivate.delete(`/api/projects/${id}`);
      toast.success("Project deleted."); load();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Delete failed."); }
  };

  const handleToggleFeatured = async (p: Project) => {
    try {
      await axiosPrivate.patch(`/api/projects/${p.id}`, { isFeatured: !p.isFeatured });
      toast.success(p.isFeatured ? "Removed from featured." : "Marked as featured.");
      load();
    } catch { toast.error("Failed to update."); }
  };

  const tableCols = [
    {
      key: "title", label: "Project",
      render: (p: Project) => (
        <div>
          <div style={{ fontWeight: 500, color: "var(--deep)", fontSize: "0.85rem", marginBottom: 2 }}>{p.title}</div>
          <code style={{ fontSize: "0.65rem", color: "var(--mgrey)", background: "var(--warm2)",
            padding: "1px 5px", borderRadius: 3 }}>{p.slug}</code>
        </div>
      ),
    },
    { key: "status",   label: "Status",    render: (p: Project) => <StatusBadge status={p.status} /> },
    {
      key: "progress", label: "Progress",
      render: (p: Project) => {
        const pct = p.goalAmount > 0 ? Math.min(100, Math.round((p.currentAmount / p.goalAmount) * 100)) : 0;
        return (
          <div style={{ minWidth: 120 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: "0.68rem", color: "var(--grey)" }}>{naira(p.currentAmount)}</span>
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--emerald)" }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} />
          </div>
        );
      },
    },
    {
      key: "donations", label: "Donations", align: "right" as const,
      render: (p: Project) => <span style={{ fontSize: "0.82rem", color: "var(--grey)" }}>{p._count?.donations ?? 0}</span>,
    },
    {
      key: "isFeatured", label: "Featured",
      render: (p: Project) => (
        <button onClick={() => handleToggleFeatured(p)}
          style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "3px 8px", borderRadius: 20, cursor: "pointer",
            background: p.isFeatured ? "rgba(201,168,76,0.12)" : "var(--warm2)",
            color: p.isFeatured ? "var(--gold)" : "var(--mgrey)",
            border: `1px solid ${p.isFeatured ? "rgba(201,168,76,0.3)" : "var(--border)"}`,
          }}>
          {p.isFeatured ? "★ Yes" : "☆ No"}
        </button>
      ),
    },
    {
      key: "createdAt", label: "Created",
      render: (p: Project) => <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>{fmtDate(p.createdAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (p: Project) => (
        <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
          <Btn onClick={() => openDetail(p)} color="var(--mid)">View</Btn>
          <Btn onClick={() => openEdit(p)}   color="var(--gold)">Edit</Btn>
          <Btn onClick={() => handleDelete(p.id, p.title)} color="#dc2626">Del</Btn>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <SectionHeader
        label="Admin"
        title="Projects"
        action={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {/* View toggle */}
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
              {(["grid", "table"] as const).map(v => (
                <button key={v} onClick={() => setView(v)} style={{
                  padding: "7px 14px", fontSize: "0.65rem", letterSpacing: "0.14em",
                  textTransform: "uppercase", cursor: "pointer", border: "none",
                  background: view === v ? "var(--deep)" : "var(--warm)",
                  color: view === v ? "var(--cream)" : "var(--grey)",
                  fontFamily: "var(--font-jost), sans-serif",
                }}>
                  {v === "grid" ? "⊞ Grid" : "≡ Table"}
                </button>
              ))}
            </div>
            <ActionButton onClick={openCreate}>+ New Project</ActionButton>
          </div>
        }
      />

      {/* Filters */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects…" style={inputStyle} />
          <div style={{ display: "flex", gap: 6 }}>
            {["", ...STATUSES].map(s => (
              <button key={s} onClick={() => setStatusF(s)} style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer", border: "none",
                fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "var(--font-jost), sans-serif",
                background: statusF === s ? "var(--deep)" : "var(--warm2)",
                color: statusF === s ? "var(--cream)" : "var(--grey)",
              }}>
                {s || "All"}
              </button>
            ))}
          </div>
          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--mgrey)" }}>
            {meta.total} projects
          </span>
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects found" sub="Adjust filters or create your first project."
          action={<ActionButton onClick={openCreate}>+ New Project</ActionButton>} />
      ) : view === "grid" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
          gap: 18, marginBottom: 28,
        }}>
          {projects.map(p => <ProjectGridCard key={p.id} project={p}
            onEdit={() => openEdit(p)}
            onView={() => openDetail(p)}
            onDelete={() => handleDelete(p.id, p.title)}
            onToggleFeatured={() => handleToggleFeatured(p)} />)}
        </div>
      ) : (
        <DataTable columns={tableCols} rows={projects} />
      )}

      <Pagination meta={meta} onPage={load} />

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <ProjectFormModal
          project={modal === "edit" ? selected : null}
          onClose={() => { setModal(null); load(); }}
        />
      )}
      {modal === "detail" && selected && (
        <ProjectDetailModal project={selected} onClose={() => setModal(null)} onEdit={() => { setModal("edit"); }} />
      )}
    </DashboardLayout>
  );
}

/* ── Project Grid Card ── */
function ProjectGridCard({ project: p, onEdit, onView, onDelete, onToggleFeatured }: {
  project: Project; onEdit: () => void; onView: () => void;
  onDelete: () => void; onToggleFeatured: () => void;
}) {
  const pct = p.goalAmount > 0 ? Math.min(100, Math.round((p.currentAmount / p.goalAmount) * 100)) : 0;
  return (
    <div style={{
      background: "#fff", border: "1px solid var(--border)", borderRadius: 16,
      overflow: "hidden", boxShadow: "0 2px 12px var(--shadow)",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 36px rgba(6,78,56,0.14)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px var(--shadow)"; }}
    >
      {/* Cover */}
      <div style={{
        height: 130, position: "relative", flexShrink: 0,
        background: p.coverImage
          ? `url(${p.coverImage}) center/cover`
          : "linear-gradient(135deg, var(--deep) 0%, var(--emerald) 60%, var(--glow) 100%)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(6,14,10,0.55), transparent)",
        }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
          <StatusBadge status={p.status} />
          {p.isFeatured && (
            <span style={{ fontSize: "0.54rem", letterSpacing: "0.16em", textTransform: "uppercase",
              background: "rgba(201,168,76,0.85)", color: "var(--ink)",
              padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
              ★ Featured
            </span>
          )}
        </div>
        <div style={{ position: "absolute", bottom: 12, right: 12 }}>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)" }}>
            {p._count?.donations ?? 0} donations
          </span>
        </div>
      </div>

      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.1rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.25,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {p.title}
        </h3>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--grey)" }}>{naira(p.currentAmount)}</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
          <div style={{ fontSize: "0.65rem", color: "var(--mgrey)", marginTop: 4 }}>Goal: {naira(p.goalAmount)}</div>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button onClick={onView} style={{ ...btnBase, flex: 1, background: "var(--warm2)", color: "var(--deep)" }}>View</button>
          <button onClick={onEdit} style={{ ...btnBase, flex: 1, background: "var(--deep)", color: "var(--cream)" }}>Edit</button>
          <button onClick={onToggleFeatured} title={p.isFeatured ? "Unfeature" : "Feature"}
            style={{ ...btnBase, width: 34, padding: 0, background: p.isFeatured ? "rgba(201,168,76,0.12)" : "var(--warm2)",
              color: p.isFeatured ? "var(--gold)" : "var(--mgrey)" }}>
            ★
          </button>
          <button onClick={onDelete}
            style={{ ...btnBase, width: 34, padding: 0, background: "rgba(220,38,38,0.07)", color: "#dc2626" }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Form Modal (Create / Edit) ── */
function ProjectFormModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const axiosPrivate = useAxiosPrivate()
  const isEdit = !!project;
  const [form, setForm] = useState({
    title:       project?.title       ?? "",
    description: project?.description ?? "",
    goalAmount:  String(project?.goalAmount ?? ""),
    coverImage:  project?.coverImage  ?? "",
    status:      project?.status      ?? "ACTIVE",
    isFeatured:  project?.isFeatured  ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.description || !form.goalAmount) {
      toast.warning("Title, description and goal amount are required.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axiosPrivate.patch(`/api/projects/${project!.id}`, { ...form, goalAmount: Number(form.goalAmount) });
        toast.success("Project updated.");
      } else {
        await axiosPrivate.post("/api/projects", { ...form, goalAmount: Number(form.goalAmount) });
        toast.success("Project created.");
      }
      onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} maxWidth={560}>
      <ModalTitle>{isEdit ? "Edit Project" : "New Project"}</ModalTitle>

      <FormField label="Title">
        <input value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="e.g. Build a School in Kano" style={inputStyle} />
      </FormField>

      <FormField label="Description">
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          placeholder="Full project description…" rows={4}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Goal Amount (₦)">
          <input type="number" value={form.goalAmount} onChange={e => set("goalAmount", e.target.value)}
            placeholder="e.g. 5000000" style={inputStyle} />
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Cover Image URL">
        <input value={form.coverImage ?? ""} onChange={e => set("coverImage", e.target.value)}
          placeholder="https://res.cloudinary.com/…" style={inputStyle} />
      </FormField>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <button onClick={() => set("isFeatured", !form.isFeatured)} style={{
          width: 42, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
          background: form.isFeatured ? "var(--mid)" : "var(--border)",
          position: "relative", flexShrink: 0, transition: "background 0.2s",
        }}>
          <span style={{
            position: "absolute", top: 2, left: form.isFeatured ? "calc(100% - 22px)" : 2,
            width: 20, height: 20, borderRadius: "50%", background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s",
          }} />
        </button>
        <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>Mark as featured project</span>
      </div>

      <ModalActions>
        <ActionButton onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner /> Saving…</> : isEdit ? "Save Changes" : "Create Project"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
      </ModalActions>
    </Modal>
  );
}

/* ── Detail Modal ── */
function ProjectDetailModal({ project: p, onClose, onEdit }: { project: Project; onClose: () => void; onEdit: () => void }) {
  const pct = p.goalAmount > 0 ? Math.min(100, Math.round((p.currentAmount / p.goalAmount) * 100)) : 0;
  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <StatusBadge status={p.status} />
        {p.isFeatured && <StatusBadge status="ACTIVE" />}
      </div>
      <ModalTitle>{p.title}</ModalTitle>
      <p style={{ fontSize: "0.82rem", color: "var(--grey)", lineHeight: 1.7,
        fontFamily: "var(--font-lora), Georgia, serif", marginBottom: 20 }}>
        {p.description}
      </p>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.75rem", color: "var(--grey)" }}>Raised: {naira(p.currentAmount)}</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}%</span>
        </div>
        <ProgressBar pct={pct} />
        <span style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>Goal: {naira(p.goalAmount)}</span>
      </div>
      {[
        ["Slug", p.slug],
        ["Created By", `${p.createdBy?.firstName} ${p.createdBy?.lastName}`],
        ["Created", fmtDate(p.createdAt)],
        ["Donations", String(p._count?.donations ?? 0)],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0",
          borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mgrey)" }}>{k}</span>
          <span style={{ fontSize: "0.82rem", color: "var(--deep)", fontWeight: 500 }}>{v}</span>
        </div>
      ))}
      <ModalActions style={{ marginTop: 24 }}>
        <ActionButton onClick={onEdit}>Edit Project</ActionButton>
        <ActionButton variant="ghost" onClick={onClose}>Close</ActionButton>
      </ModalActions>
    </Modal>
  );
}

/* ── Shared UI atoms ── */
const btnBase: React.CSSProperties = {
  padding: "7px 12px", borderRadius: 8, cursor: "pointer",
  border: "1px solid var(--border)", fontSize: "0.68rem",
  letterSpacing: "0.1em", textTransform: "uppercase",
  fontFamily: "var(--font-jost), sans-serif",
  fontWeight: 500, transition: "opacity 0.15s",
};

function Btn({ onClick, color, children }: any) {
  return (
    <button onClick={onClick} style={{
      ...btnBase, background: `${color}12`, color, border: `1px solid ${color}30`,
    }}>{children}</button>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

function Modal({ children, onClose, maxWidth = 480 }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6,14,10,0.6)", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, overflowY: "auto" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32,
        width: "100%", maxWidth, boxShadow: "0 24px 80px rgba(6,78,56,0.22)",
        maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ children }: any) {
  return (
    <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
      fontSize: "1.7rem", fontWeight: 700, color: "var(--deep)", marginBottom: 20, lineHeight: 1.2 }}>
      {children}
    </h2>
  );
}

function FormField({ label, children }: any) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ModalActions({ children, style }: any) {
  return <div style={{ display: "flex", gap: 10, flexWrap: "wrap", ...style }}>{children}</div>;
}

function Pagination({ meta, onPage }: { meta: any; onPage: (p: number) => void }) {
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