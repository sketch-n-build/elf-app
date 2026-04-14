"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, ActionButton, Panel,
  LoadingDots, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

interface Donor {
  id: string; email: string | null; fullName: string | null;
  phone: string | null; isAnonymous: boolean; createdAt: string;
  _count?: { donations: number }; totalDonatedNaira?: number;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

export default function AdminDonorsPage() {
  const [donors, setDonors]   = useState<Donor[]>([]);
  const [meta, setMeta]       = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [anonFilter, setAnon] = useState("");
  const [modal, setModal]     = useState<"create" | "detail" | null>(null);
  const [selected, setSelected] = useState<Donor | null>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "15" });
      if (search)           p.set("search", search);
      if (anonFilter !== "") p.set("anonymous", anonFilter);
      const { data } = await axiosPrivate.get(`/api/donors?${p}`);
      setDonors(data.data); setMeta(data.meta);
    } catch { toast.error("Failed to load donors."); }
    finally { setLoading(false); }
  }, [search, anonFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete donor "${name}"?`)) return;
    try {
      await axiosPrivate.delete(`/api/donors/${id}`);
      toast.success("Donor deleted."); load();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Delete failed."); }
  };

  const cols = [
    {
      key: "name", label: "Donor",
      render: (d: Donor) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: d.isAnonymous
              ? "rgba(138,168,153,0.3)"
              : "linear-gradient(135deg, var(--deep), var(--emerald))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.9rem", fontWeight: 700,
            color: d.isAnonymous ? "var(--mgrey)" : "var(--pale)" }}>
            {d.isAnonymous ? "?" : (d.fullName ?? d.email ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--deep)" }}>
              {d.isAnonymous ? "Anonymous Donor" : (d.fullName ?? "—")}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>{d.email ?? "—"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "totalDonatedNaira", label: "Total Given", align: "right" as const,
      render: (d: Donor) => (
        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.05rem", fontWeight: 700, color: "var(--emerald)" }}>
          {naira(d.totalDonatedNaira ?? 0)}
        </span>
      ),
    },
    {
      key: "donations", label: "Gifts",
      render: (d: Donor) => (
        <span style={{ fontSize: "0.82rem", color: "var(--grey)" }}>{d._count?.donations ?? 0}</span>
      ),
    },
    {
      key: "phone", label: "Phone",
      render: (d: Donor) => <span style={{ fontSize: "0.75rem", color: "var(--grey)" }}>{d.phone ?? "—"}</span>,
    },
    {
      key: "isAnonymous", label: "Type",
      render: (d: Donor) => (
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.16em", textTransform: "uppercase",
          padding: "3px 8px", borderRadius: 20,
          background: d.isAnonymous ? "rgba(138,168,153,0.12)" : "rgba(16,185,129,0.1)",
          color: d.isAnonymous ? "var(--mgrey)" : "var(--mid)" }}>
          {d.isAnonymous ? "Anonymous" : "Named"}
        </span>
      ),
    },
    {
      key: "createdAt", label: "Registered",
      render: (d: Donor) => <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>{fmtDate(d.createdAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (d: Donor) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => { setSelected(d); setModal("detail"); }}
            style={actionBtn("#16a34a")}>View</button>
          <button onClick={() => handleDelete(d.id, d.fullName ?? "donor")}
            style={actionBtn("#dc2626")}>Del</button>
        </div>
      ),
    },
  ];

  const totalRaised = donors.reduce((s, d) => s + (d.totalDonatedNaira ?? 0), 0);

  return (
    <DashboardLayout>
      <SectionHeader
        label="Admin"
        title="Donors"
        action={<ActionButton onClick={() => setModal("create")}>+ Add Donor</ActionButton>}
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Donors", value: String(meta.total), color: "var(--deep)" },
          { label: "Named",        value: String(donors.filter(d => !d.isAnonymous).length), color: "var(--mid)" },
          { label: "Anonymous",    value: String(donors.filter(d => d.isAnonymous).length), color: "var(--mgrey)" },
          { label: "Total Given",  value: naira(totalRaised), color: "var(--emerald)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 18px", flex: "1 1 100px" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email…" style={{ ...inputStyle, maxWidth: 300 }} />
          <div style={{ display: "flex", gap: 6 }}>
            {[["", "All"], ["false", "Named"], ["true", "Anonymous"]].map(([v, l]) => (
              <button key={v} onClick={() => setAnon(v)} style={{
                padding: "6px 14px", borderRadius: 20, cursor: "pointer", border: "none",
                fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase",
                fontFamily: "var(--font-jost), sans-serif",
                background: anonFilter === v ? "var(--deep)" : "var(--warm2)",
                color: anonFilter === v ? "var(--cream)" : "var(--grey)",
              }}>{l}</button>
            ))}
          </div>
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : donors.length === 0 ? (
        <EmptyState title="No donors found" sub="Donors are created automatically when a donation is processed." />
      ) : (
        <DataTable columns={cols} rows={donors} />
      )}

      <Pagination meta={meta} onPage={load} />

      {modal === "create" && <CreateDonorModal onClose={() => { setModal(null); load(); }} />}

      {modal === "detail" && selected && (
        <DonorDetailModal donor={selected} onClose={() => setModal(null)} />
      )}
    </DashboardLayout>
  );
}

/* ── Create Donor Modal ── */
function CreateDonorModal({ onClose }: { onClose: () => void }) {
  const axiosPrivate = useAxiosPrivate()
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", isAnonymous: false });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosPrivate.post("/api/donors", form);
      toast.success("Donor added."); onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <Modal onClose={onClose}>
      <ModalTitle>Add Donor</ModalTitle>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Toggle value={form.isAnonymous} onChange={v => set("isAnonymous", v)} />
        <span style={{ fontSize: "0.78rem", color: "var(--grey)" }}>Anonymous donor</span>
      </div>
      {!form.isAnonymous && (
        <>
          <FormField label="Full Name"><input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Ada Obi" style={inputStyle} /></FormField>
          <FormField label="Email"><input value={form.email} onChange={e => set("email", e.target.value)} placeholder="ada@example.com" style={inputStyle} /></FormField>
          <FormField label="Phone"><input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+234 801 234 5678" style={inputStyle} /></FormField>
        </>
      )}
      <ModalActions>
        <ActionButton onClick={handleSave} disabled={saving}>{saving ? <><Spinner /> Saving…</> : "Add Donor"}</ActionButton>
        <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
      </ModalActions>
    </Modal>
  );
}

/* ── Donor Detail Modal ── */
function DonorDetailModal({ donor: d, onClose }: { donor: Donor; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%",
          background: d.isAnonymous ? "rgba(138,168,153,0.3)" : "linear-gradient(135deg, var(--deep), var(--emerald))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.2rem", fontWeight: 700,
          color: d.isAnonymous ? "var(--mgrey)" : "var(--pale)", flexShrink: 0 }}>
          {d.isAnonymous ? "?" : (d.fullName ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <ModalTitle>{d.isAnonymous ? "Anonymous Donor" : (d.fullName ?? "Unknown")}</ModalTitle>
        </div>
      </div>
      {[
        ["Email",       d.email    ?? "—"],
        ["Phone",       d.phone    ?? "—"],
        ["Type",        d.isAnonymous ? "Anonymous" : "Named"],
        ["Total Given", naira(d.totalDonatedNaira ?? 0)],
        ["Donations",   String(d._count?.donations ?? 0)],
        ["Registered",  fmtDate(d.createdAt)],
      ].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--mgrey)" }}>{k}</span>
          <span style={{ fontSize: "0.82rem", color: "var(--deep)", fontWeight: 500 }}>{v}</span>
        </div>
      ))}
      <div style={{ marginTop: 24 }}>
        <ActionButton variant="ghost" onClick={onClose}>Close</ActionButton>
      </div>
    </Modal>
  );
}

/* ── Shared atoms ── */
const actionBtn = (color: string): React.CSSProperties => ({
  padding: "4px 10px", borderRadius: 6, cursor: "pointer",
  fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
  background: `${color}12`, color, border: `1px solid ${color}30`,
  fontFamily: "var(--font-jost), sans-serif",
});
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return <button onClick={() => onChange(!value)} style={{ width: 42, height: 24, borderRadius: 99, border: "none", cursor: "pointer", background: value ? "var(--mid)" : "var(--border)", position: "relative", flexShrink: 0, transition: "background 0.2s" }}><span style={{ position: "absolute", top: 2, left: value ? "calc(100% - 22px)" : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} /></button>;
}
function Modal({ children, onClose, maxWidth = 480 }: any) {
  return <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.6)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }} onClick={onClose}><div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth, boxShadow: "0 24px 80px rgba(6,78,56,0.22)", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>{children}</div></div>;
}
function ModalTitle({ children }: any) { return <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--deep)", marginBottom: 0, lineHeight: 1.2 }}>{children}</h2>; }
function FormField({ label, children }: any) { return <div style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>{label}</label>{children}</div>; }
function ModalActions({ children }: any) { return <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{children}</div>; }
function Pagination({ meta, onPage }: any) {
  if (meta.totalPages <= 1) return null;
  return <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>{Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => onPage(p)} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", border: "1px solid var(--border)", background: p === meta.page ? "var(--deep)" : "var(--warm)", color: p === meta.page ? "var(--cream)" : "var(--grey)", fontSize: "0.78rem" }}>{p}</button>)}</div>;
}