"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, Panel, ActionButton,
  LoadingDots, EmptyState, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";

interface Investment {
  id: string; amount: number; createdAt: string;
  project: { id: string; title: string; slug: string; status: string } | null;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid var(--border)", background: "var(--warm)",
  fontSize: "0.85rem", color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif", outline: "none",
};

export default function AdminInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [meta, setMeta]   = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [editModal, setEditModal] = useState<Investment | null>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      const { data } = await axiosPrivate.get(`/api/investments?${p}`);
      setInvestments(data.data); setMeta(data.meta);
    } catch { toast.error("Failed to load investments."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this investment record?")) return;
    try {
      await axiosPrivate.delete(`/api/investments/${id}`);
      toast.success("Investment deleted."); load();
    } catch { toast.error("Delete failed."); }
  };

  // Client-side filter
  const filtered = search
    ? investments.filter(i =>
        i.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        i.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        i.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        i.project?.title?.toLowerCase().includes(search.toLowerCase()))
    : investments;

  const totalInvested = investments.reduce((s, i) => s + Number(i.amount), 0);
  const uniqueInvestors = new Set(investments.map(i => i.user?.id)).size;
  const uniqueProjects  = new Set(investments.map(i => i.project?.id)).size;

  const cols = [
    {
      key: "investor", label: "Investor",
      render: (i: Investment) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--deep), var(--glow))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.82rem", fontWeight: 700, color: "var(--pale)" }}>
            {i.user?.firstName?.[0]}{i.user?.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>
              {i.user?.firstName} {i.user?.lastName}
            </div>
            <div style={{ fontSize: "0.65rem", color: "var(--mgrey)" }}>{i.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "project", label: "Project",
      render: (i: Investment) => (
        <div>
          <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>{i.project?.title ?? "—"}</div>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase",
            marginTop: 2,
            color: i.project?.status === "ACTIVE" ? "var(--mid)" : "var(--mgrey)" }}>
            {i.project?.status ?? ""}
          </div>
        </div>
      ),
    },
    {
      key: "amount", label: "Amount", align: "right" as const,
      render: (i: Investment) => (
        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.1rem", fontWeight: 700, color: "var(--glow)" }}>
          {naira(i.amount)}
        </span>
      ),
    },
    {
      key: "createdAt", label: "Date",
      render: (i: Investment) => <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>{fmtDate(i.createdAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (i: Investment) => (
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setEditModal(i)}
            style={{ padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.62rem",
              letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(201,168,76,0.1)",
              color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)",
              fontFamily: "var(--font-jost), sans-serif" }}>
            Correct
          </button>
          <button onClick={() => handleDelete(i.id)}
            style={{ padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.62rem",
              letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(220,38,38,0.07)",
              color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)",
              fontFamily: "var(--font-jost), sans-serif" }}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <SectionHeader label="Admin" title="Investments" />

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total Records",    value: String(meta.total),       color: "var(--deep)" },
          { label: "Total Invested",   value: naira(totalInvested),     color: "var(--glow)" },
          { label: "Unique Investors", value: String(uniqueInvestors),  color: "var(--mid)" },
          { label: "Projects Backed",  value: String(uniqueProjects),   color: "var(--gold)" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 18px", flex: "1 1 120px" }}>
            <div style={{ fontSize: "0.54rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <Panel style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by investor name, email or project…"
          style={{ ...inputStyle, maxWidth: 380 }} />
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No investments found" sub="Investments are created by platform investors." />
      ) : (
        <DataTable columns={cols} rows={filtered} />
      )}

      <Pagination meta={meta} onPage={load} />

      {editModal && (
        <EditInvestmentModal
          investment={editModal}
          onClose={() => { setEditModal(null); load(); }}
        />
      )}
    </DashboardLayout>
  );
}

/* ── Edit / Correct Investment Modal ── */
function EditInvestmentModal({ investment, onClose }: { investment: Investment; onClose: () => void }) {
  const axiosPrivate = useAxiosPrivate()
  const [amount, setAmount] = useState(String(investment.amount));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) { toast.warning("Enter a valid amount."); return; }
    setSaving(true);
    try {
      await axiosPrivate.patch(`/api/investments/${investment.id}`, { amount: Number(amount) });
      toast.success("Investment corrected."); onClose();
    } catch (e: any) { toast.error(e?.response?.data?.error ?? "Update failed."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(6,14,10,0.6)",
      backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 80px rgba(6,78,56,0.22)" }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.6rem",
          fontWeight: 700, color: "var(--deep)", marginBottom: 8 }}>Correct Investment</h2>
        <p style={{ fontSize: "0.78rem", color: "var(--grey)", marginBottom: 20, lineHeight: 1.6 }}>
          Adjusting amount for <strong>{investment.user?.firstName} {investment.user?.lastName}</strong>'s
          investment in <strong>{investment.project?.title ?? "project"}</strong>.
          This is an admin-only data correction.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>
            Investment Amount (₦)
          </label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            style={inputStyle} />
          <div style={{ fontSize: "0.65rem", color: "var(--mgrey)", marginTop: 4 }}>
            Original: {naira(investment.amount)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <ActionButton onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner /> Saving…</> : "Save Correction"}
          </ActionButton>
          <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
        </div>
      </div>
    </div>
  );
}

function Pagination({ meta, onPage }: any) {
  if (meta.totalPages <= 1) return null;
  return <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>{Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => onPage(p)} style={{ width: 34, height: 34, borderRadius: 8, cursor: "pointer", border: "1px solid var(--border)", background: p === meta.page ? "var(--deep)" : "var(--warm)", color: p === meta.page ? "var(--cream)" : "var(--grey)", fontSize: "0.78rem" }}>{p}</button>)}</div>;
}