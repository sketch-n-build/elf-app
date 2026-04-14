"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, ActionButton, StatusBadge,
  LoadingDots, ProgressBar, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

interface Project {
  id: string; title: string; slug: string; description: string;
  coverImage: string | null; goalAmount: number; currentAmount: number;
  status: string; isFeatured: boolean; createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  _count?: { donations: number };
}
interface Update { id: string; title: string; content: string; image: string | null; createdAt: string; }

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

export default function StaffProjectsPage() {
  const axiosPrivate = useAxiosPrivate();

  const [projects,    setProjects]    = useState<Project[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState<"create" | "edit" | "update" | null>(null);
  const [selected,    setSelected]    = useState<Project | null>(null);
  const [updates,     setUpdates]     = useState<Update[]>([]);
  const [showUpdates, setShowUpdates] = useState<string | null>(null);

  // FIX 1 + 3 — correct URL, no client filter, dep is axiosPrivate not user
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosPrivate.get("/api/staff/projects?limit=100");
      setProjects(data.data ?? []);
    } catch { toast.error("Failed to load projects."); }
    finally { setLoading(false); }
  }, [axiosPrivate]); // ← was [user]

  // FIX 2 — no loadingUser/email guard; API is server-scoped, interceptor handles 401
  useEffect(() => { load(); }, [load]);

  // FIX 6b — correct URL for updates
  const loadUpdates = async (projectId: string) => {
    try {
      const { data } = await axiosPrivate.get(`/api/staff/projects/${projectId}/updates`);
      setUpdates(data.data ?? []);
      setShowUpdates(projectId);
    } catch { toast.error("Failed to load updates."); }
  };

  // FIX 6c — correct URL for delete
  const handleDelete = async (p: Project) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      await axiosPrivate.delete(`/api/staff/projects/${p.id}`);
      toast.success("Project deleted."); load();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Delete failed."); }
  };

  const active      = projects.filter(p => p.status === "ACTIVE").length;
  const completed   = projects.filter(p => p.status === "COMPLETED").length;
  const totalRaised = projects.reduce((s, p) => s + Number(p.currentAmount), 0);

  return (
    <DashboardLayout>
      <SectionHeader
        label="My Work"
        title="My Projects"
        action={<ActionButton onClick={() => { setSelected(null); setModal("create"); }}>+ New Project</ActionButton>}
      />

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total",     value: String(projects.length), color: "var(--deep)" },
          { label: "Active",    value: String(active),          color: "var(--mid)" },
          { label: "Completed", value: String(completed),       color: "var(--glow)" },
          { label: "Raised",    value: naira(totalRaised),      color: "var(--emerald)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 18px", flex: "1 1 100px" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" sub="Create your first project to start tracking impact and raising funds."
          action={<ActionButton onClick={() => setModal("create")}>+ Create Project</ActionButton>} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {projects.map(p => (
            <StaffProjectRow
              key={p.id}
              project={p}
              updates={showUpdates === p.id ? updates : undefined}
              onEdit={() => { setSelected(p); setModal("edit"); }}
              onDelete={() => handleDelete(p)}
              onPostUpdate={() => { setSelected(p); setModal("update"); }}
              onViewUpdates={() => showUpdates === p.id ? setShowUpdates(null) : loadUpdates(p.id)}
            />
          ))}
        </div>
      )}

      {/* FIX 4 + 5 — pass axiosPrivate as prop to both modals */}
      {(modal === "create" || modal === "edit") && (
        <ProjectFormModal
          project={modal === "edit" ? selected : null}
          axiosPrivate={axiosPrivate}
          onClose={() => { setModal(null); load(); }}
        />
      )}
      {modal === "update" && selected && (
        <PostUpdateModal
          projectId={selected.id}
          projectTitle={selected.title}
          axiosPrivate={axiosPrivate}
          onClose={() => { setModal(null); loadUpdates(selected.id); }}
        />
      )}
    </DashboardLayout>
  );
}

/* ── Staff Project Row ── */
function StaffProjectRow({ project: p, updates, onEdit, onDelete, onPostUpdate, onViewUpdates }: {
  project: Project; updates?: Update[]; onEdit: () => void; onDelete: () => void;
  onPostUpdate: () => void; onViewUpdates: () => void;
}) {
  const pct = p.goalAmount > 0 ? Math.min(100, Math.round((Number(p.currentAmount) / Number(p.goalAmount)) * 100)) : 0;
  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px var(--shadow)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: "18px 24px", gap: 16, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <StatusBadge status={p.status} />
            {p.isFeatured && <span style={{ fontSize: "0.54rem", letterSpacing: "0.16em", textTransform: "uppercase", background: "rgba(201,168,76,0.12)", color: "var(--gold)", padding: "3px 8px", borderRadius: 4 }}>★ Featured</span>}
          </div>
          <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.2, marginBottom: 4 }}>{p.title}</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--grey)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <SmBtn onClick={onEdit}        color="var(--gold)">Edit</SmBtn>
          <SmBtn onClick={onPostUpdate}  color="var(--mid)">+ Update</SmBtn>
          <SmBtn onClick={onViewUpdates} color="var(--deep)">{updates !== undefined ? "Hide" : "Updates"}</SmBtn>
          <SmBtn onClick={onDelete}      color="#dc2626">Delete</SmBtn>
        </div>
      </div>

      <div style={{ padding: "14px 24px 18px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 14 }}>
          {[
            { label: "Raised",    value: naira(p.currentAmount),           color: "var(--emerald)" },
            { label: "Goal",      value: naira(p.goalAmount),              color: "var(--deep)" },
            { label: "Donations", value: String(p._count?.donations ?? 0), color: "var(--mid)" },
            { label: "Progress",  value: `${pct}%`,                        color: "var(--glow)" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "0.54rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <ProgressBar pct={pct} />
        <div style={{ fontSize: "0.62rem", color: "var(--mgrey)", marginTop: 6 }}>Created {fmtDate(p.createdAt)} · Slug: {p.slug}</div>
      </div>

      {updates !== undefined && (
        <div style={{ borderTop: "1px solid var(--border)", background: "var(--warm)" }}>
          <div style={{ padding: "14px 24px" }}>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 12 }}>Project Updates ({updates.length})</div>
            {updates.length === 0 ? (
              <p style={{ fontSize: "0.78rem", color: "var(--mgrey)" }}>No updates posted yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {updates.map(u => (
                  <div key={u.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--deep)" }}>{u.title}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>{fmtDate(u.createdAt)}</span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--grey)", lineHeight: 1.6 }}>{u.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Project Form Modal ── */
function ProjectFormModal({ project, onClose, axiosPrivate }: {
  project: Project | null; onClose: () => void;
  axiosPrivate: ReturnType<typeof useAxiosPrivate>;
}) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    title: project?.title ?? "", description: project?.description ?? "",
    goalAmount: String(project?.goalAmount ?? ""),
    coverImage: project?.coverImage ?? "", status: project?.status ?? "ACTIVE",
    isFeatured: project?.isFeatured ?? false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.description || !form.goalAmount) {
      toast.warning("Title, description and goal are required."); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axiosPrivate.patch(`/api/staff/projects/${project!.id}`, { ...form, goalAmount: Number(form.goalAmount) });
        toast.success("Project updated.");
      } else {
        await axiosPrivate.post("/api/staff/projects", { ...form, goalAmount: Number(form.goalAmount) });
        toast.success("Project created.");
      }
      onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose} maxWidth={560}>
      <ModalTitle>{isEdit ? "Edit Project" : "New Project"}</ModalTitle>
      <FormField label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Rebuild a Classroom in Enugu" style={inputStyle} /></FormField>
      <FormField label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Goal Amount (₦)"><input type="number" value={form.goalAmount} onChange={e => set("goalAmount", e.target.value)} style={inputStyle} /></FormField>
        <FormField label="Status">
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
            {["ACTIVE", "PAUSED", "COMPLETED"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Cover Image URL"><input value={form.coverImage} onChange={e => set("coverImage", e.target.value)} placeholder="https://…" style={inputStyle} /></FormField>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Toggle value={form.isFeatured} onChange={v => set("isFeatured", v)} />
        <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>Mark as featured</span>
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

/* ── Post Update Modal ── */
function PostUpdateModal({ projectId, projectTitle, onClose, axiosPrivate }: {
  projectId: string; projectTitle: string; onClose: () => void;
  axiosPrivate: ReturnType<typeof useAxiosPrivate>;
}) {
  const [form, setForm] = useState({ title: "", content: "", image: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.warning("Title and content required."); return; }
    setSaving(true);
    try {
      await axiosPrivate.post(`/api/staff/projects/${projectId}/updates`, form);
      toast.success("Update posted."); onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalTitle>Post Update</ModalTitle>
      <p style={{ fontSize: "0.78rem", color: "var(--grey)", marginBottom: 20 }}>Posting update for: <strong>{projectTitle}</strong></p>
      <FormField label="Update Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Foundation work complete" style={inputStyle} /></FormField>
      <FormField label="Content"><textarea value={form.content} onChange={e => set("content", e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></FormField>
      <FormField label="Image URL (optional)"><input value={form.image} onChange={e => set("image", e.target.value)} placeholder="https://…" style={inputStyle} /></FormField>
      <ModalActions>
        <ActionButton onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner /> Posting…</> : "Post Update"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
      </ModalActions>
    </Modal>
  );
}

/* ── Shared atoms ── */
function SmBtn({ onClick, color, children }: any) {
  return <button onClick={onClick} style={{ padding: "6px 12px", borderRadius: 7, cursor: "pointer", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", background: `${color}12`, color, border: `1px solid ${color}30`, fontFamily: "var(--font-jost), sans-serif" }}>{children}</button>;
}
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: value ? "var(--mid)" : "var(--border)", position: "relative", flexShrink: 0, transition: "background 0.2s" }}><span style={{ position: "absolute", top: 2, left: value ? "calc(100% - 22px)" : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} /></button>;
}
function Modal({ children, onClose, maxWidth = 520 }: any) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }} onClick={onClose}><div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth, boxShadow: "0 24px 80px rgba(6,78,56,0.22)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>{children}</div></div>;
}
function ModalTitle({ children }: any) { return <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--deep)", marginBottom: 20, lineHeight: 1.2 }}>{children}</h2>; }
function FormField({ label, children }: any) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>{label}</label>{children}</div>; }
function ModalActions({ children }: any) { return <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{children}</div>; }