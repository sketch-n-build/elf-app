"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, ActionButton, Panel, StatusBadge,
  LoadingDots, ProgressBar, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

interface Campaign {
  id: string; title: string; description: string;
  targetAmount: number; isActive: boolean; createdAt: string;
  _count?: { donations: number };
  raisedAmount?: number;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

/* ═══════════════════════════════════════════════════════════════ */
export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [meta, setMeta]           = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [selected, setSelected]   = useState<Campaign | null>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "9" });
      if (search) p.set("search", search);
      const { data } = await axiosPrivate.get(`/api/campaigns?${p}`);
      setCampaigns(data.data); setMeta(data.meta);
    } catch { toast.error("Failed to load campaigns."); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleToggleActive = async (c: Campaign) => {
    try {
      await axiosPrivate.patch(`/api/campaigns/${c.id}`, { isActive: !c.isActive });
      toast.success(c.isActive ? "Campaign paused." : "Campaign activated."); load();
    } catch { toast.error("Update failed."); }
  };

  const handleDelete = async (c: Campaign) => {
    const conf = confirm(`Delete "${c.title}"?${c._count?.donations ? `\nThis campaign has ${c._count.donations} donation(s). Add ?force=true to remove them too.` : ""}`);
    if (!conf) return;
    try {
      await axiosPrivate.delete(`/api/campaigns/${c.id}?force=true`);
      toast.success("Campaign deleted."); load();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Delete failed."); }
  };

  const totalActive  = campaigns.filter(c => c.isActive).length;
  const totalRaised  = campaigns.reduce((s, c) => s + (c.raisedAmount ?? 0), 0);

  return (
    <DashboardLayout>
      <SectionHeader
        label="Admin"
        title="Campaigns"
        action={<ActionButton onClick={() => { setSelected(null); setModal("create"); }}>+ New Campaign</ActionButton>}
      />

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total",   value: meta.total,       color: "var(--deep)" },
          { label: "Active",  value: totalActive,      color: "var(--mid)" },
          { label: "Raised",  value: naira(totalRaised), color: "var(--emerald)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 20px", flex: "1 1 100px" }}>
            <div style={{ fontSize: "0.56rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <Panel style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search campaigns…" style={{ ...inputStyle, maxWidth: 340 }} />
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : campaigns.length === 0 ? (
        <EmptyState title="No campaigns yet" sub="Launch your first fundraising campaign."
          action={<ActionButton onClick={() => setModal("create")}>+ New Campaign</ActionButton>} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 18, marginBottom: 28 }}>
          {campaigns.map(c => <CampaignCard key={c.id} campaign={c}
            onEdit={() => { setSelected(c); setModal("edit"); }}
            onToggle={() => handleToggleActive(c)}
            onDelete={() => handleDelete(c)} />)}
        </div>
      )}

      <Pagination meta={meta} onPage={load} />

      {(modal === "create" || modal === "edit") && (
        <CampaignFormModal
          campaign={modal === "edit" ? selected : null}
          onClose={() => { setModal(null); load(); }}
        />
      )}
    </DashboardLayout>
  );
}

/* ── Campaign Card ── */
function CampaignCard({ campaign: c, onEdit, onToggle, onDelete }: {
  campaign: Campaign; onEdit: () => void; onToggle: () => void; onDelete: () => void;
}) {
  const raised = c.raisedAmount ?? 0;
  const pct = c.targetAmount > 0 ? Math.min(100, Math.round((raised / Number(c.targetAmount)) * 100)) : 0;

  return (
    <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 18,
      overflow: "hidden", boxShadow: "0 2px 12px var(--shadow)",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s" }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(6,78,56,0.13)"; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px var(--shadow)"; }}
    >
      {/* Header band */}
      <div style={{ background: c.isActive
        ? "linear-gradient(135deg, var(--deep) 0%, var(--emerald) 100%)"
        : "linear-gradient(135deg, var(--ink) 0%, #2a3a32 100%)",
        padding: "18px 20px 16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontSize: "0.54rem", letterSpacing: "0.28em", textTransform: "uppercase",
            color: c.isActive ? "rgba(168,230,216,0.7)" : "rgba(255,255,255,0.35)" }}>
            Campaign
          </div>
          <StatusBadge status={c.isActive ? "ACTIVE" : "PAUSED"} />
        </div>
        <h3 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.2rem", fontWeight: 700, color: "var(--cream)",
          lineHeight: 1.25, marginTop: 8 }}>
          {c.title}
        </h3>
      </div>

      <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: "0.75rem", color: "var(--grey)", lineHeight: 1.6,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {c.description}
        </p>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--grey)" }}>{naira(raised)} raised</span>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--emerald)" }}>{pct}%</span>
          </div>
          <ProgressBar pct={pct} color={c.isActive ? "var(--emerald)" : "var(--mgrey)"} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>Target: {naira(c.targetAmount)}</span>
            <span style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>{c._count?.donations ?? 0} donations</span>
          </div>
        </div>

        <div style={{ fontSize: "0.65rem", color: "var(--mgrey)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
          Created {fmtDate(c.createdAt)}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onEdit} style={{ ...mBtn, flex: 1, background: "var(--warm2)", color: "var(--deep)" }}>Edit</button>
          <button onClick={onToggle} style={{ ...mBtn, flex: 1,
            background: c.isActive ? "rgba(201,168,76,0.1)" : "rgba(16,185,129,0.1)",
            color: c.isActive ? "var(--gold)" : "var(--mid)" }}>
            {c.isActive ? "Pause" : "Activate"}
          </button>
          <button onClick={onDelete} style={{ ...mBtn, width: 34, padding: 0,
            background: "rgba(220,38,38,0.07)", color: "#dc2626" }}>✕</button>
        </div>
      </div>
    </div>
  );
}

/* ── Campaign Form Modal ── */
function CampaignFormModal({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  const axiosPrivate = useAxiosPrivate()
  const isEdit = !!campaign;
  const [form, setForm] = useState({
    title:        campaign?.title        ?? "",
    description:  campaign?.description  ?? "",
    targetAmount: String(campaign?.targetAmount ?? ""),
    isActive:     campaign?.isActive     ?? true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.description || !form.targetAmount) {
      toast.warning("All fields are required."); return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await axiosPrivate.patch(`/api/campaigns/${campaign!.id}`, { ...form, targetAmount: Number(form.targetAmount) });
        toast.success("Campaign updated.");
      } else {
        await axiosPrivate.post("/api/campaigns", { ...form, targetAmount: Number(form.targetAmount) });
        toast.success("Campaign created.");
      }
      onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Save failed."); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalTitle>{isEdit ? "Edit Campaign" : "New Campaign"}</ModalTitle>
      <FormField label="Title"><input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. End of Year Giving Drive" style={inputStyle} /></FormField>
      <FormField label="Description"><textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="What is this campaign about?" rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} /></FormField>
      <FormField label="Target Amount (₦)"><input type="number" value={form.targetAmount} onChange={e => set("targetAmount", e.target.value)} placeholder="e.g. 10000000" style={inputStyle} /></FormField>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Toggle value={form.isActive} onChange={v => set("isActive", v)} />
        <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>Launch as active campaign</span>
      </div>
      <ModalActions>
        <ActionButton onClick={handleSave} disabled={saving}>
          {saving ? <><Spinner /> Saving…</> : isEdit ? "Save Changes" : "Create Campaign"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
      </ModalActions>
    </Modal>
  );
}

/* ── Shared atoms ── */
const mBtn: React.CSSProperties = {
  padding: "8px 12px", borderRadius: 8, cursor: "pointer", border: "none",
  fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase",
  fontFamily: "var(--font-jost), sans-serif", fontWeight: 600,
};
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: value ? "var(--mid)" : "var(--border)", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
      <span style={{ position: "absolute", top: 2, left: value ? "calc(100% - 22px)" : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
    </button>
  );
}
function Modal({ children, onClose, maxWidth = 520 }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth, boxShadow: "0 24px 80px rgba(6,78,56,0.22)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}
function ModalTitle({ children }: any) { return <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.7rem", fontWeight: 700, color: "var(--deep)", marginBottom: 20, lineHeight: 1.2 }}>{children}</h2>; }
function FormField({ label, children }: any) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>{label}</label>{children}</div>; }
function ModalActions({ children }: any) { return <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{children}</div>; }
function Pagination({ meta, onPage }: any) {
  if (meta.totalPages <= 1) return null;
  return <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>{Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => onPage(p)} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", border: "1px solid var(--border)", background: p === meta.page ? "var(--deep)" : "var(--warm)", color: p === meta.page ? "var(--cream)" : "var(--grey)", fontSize: "0.78rem" }}>{p}</button>)}</div>;
}