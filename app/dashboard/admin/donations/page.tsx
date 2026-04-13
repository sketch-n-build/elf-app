"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, ActionButton, Panel,
  StatusBadge, LoadingDots, naira, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([]);
  const [meta, setMeta]           = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading]     = useState(true);
  const [status, setStatus]       = useState("");
  const [selected, setSelected]   = useState<any>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status) params.set("status", status);
      const { data } = await axiosPrivate.get(`/api/donations?${params}`);
      setDonations(data.data);
      setMeta(data.meta);
    } catch { toast.error("Failed to load donations."); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this donation record? This will reverse the project's amount.")) return;
    try {
      await axiosPrivate.delete(`/api/donations/${id}`);
      toast.success("Donation deleted.");
      load();
    } catch { toast.error("Failed to delete donation."); }
  };

  const cols = [
    {
      key: "donor", label: "Donor",
      render: (r: any) => (
        <div>
          <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>
            {r.donor?.isAnonymous ? "Anonymous" : r.donor?.fullName ?? "Unknown"}
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>
            {r.donor?.email ?? "—"}
          </div>
        </div>
      ),
    },
    {
      key: "amount", label: "Amount", align: "right" as const,
      render: (r: any) => (
        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.1rem", fontWeight: 700, color: "var(--emerald)" }}>
          {naira(r.amount)}
        </span>
      ),
    },
    {
      key: "paystackStatus", label: "Status",
      render: (r: any) => <StatusBadge status={r.paystackStatus} />,
    },
    {
      key: "project", label: "Project",
      render: (r: any) => r.project
        ? <span style={{ fontSize: "0.75rem", color: "var(--mid)" }}>{r.project.title}</span>
        : <span style={{ color: "var(--mgrey)" }}>—</span>,
    },
    {
      key: "paystackReference", label: "Reference",
      render: (r: any) => (
        <code style={{ fontSize: "0.68rem", background: "var(--warm2)",
          padding: "2px 6px", borderRadius: 4, color: "var(--grey)" }}>
          {r.paystackReference?.slice(0, 12)}…
        </code>
      ),
    },
    {
      key: "paidAt", label: "Date",
      render: (r: any) => <span style={{ fontSize: "0.75rem", color: "var(--mgrey)" }}>{fmtDate(r.paidAt)}</span>,
    },
    {
      key: "actions", label: "",
      render: (r: any) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSelected(r)}
            style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "var(--mid)", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
            View
          </button>
          <button onClick={() => handleDelete(r.id)}
            style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#dc2626", background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const totalSuccess = donations.filter(d => d.paystackStatus === "SUCCESS").reduce((s, d) => s + Number(d.amount), 0);

  return (
    <DashboardLayout>
      <SectionHeader label="Admin" title="Donation Records" />

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total Records", value: String(meta.total), color: "var(--deep)" },
          { label: "Shown (Success)", value: naira(totalSuccess), color: "var(--emerald)" },
          { label: "Successful", value: String(donations.filter(d => d.paystackStatus === "SUCCESS").length), color: "var(--mid)" },
          { label: "Pending", value: String(donations.filter(d => d.paystackStatus === "PENDING").length), color: "var(--gold)" },
          { label: "Failed", value: String(donations.filter(d => d.paystackStatus === "FAILED").length), color: "#dc2626" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
            padding: "14px 18px",
          }}>
            <div style={{ fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--mgrey)", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.5rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--mgrey)", marginRight: 4 }}>
            Filter:
          </span>
          {["", "SUCCESS", "PENDING", "FAILED"].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              style={{
                padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase",
                border: `1px solid ${status === s ? "var(--mid)" : "var(--border)"}`,
                background: status === s ? "rgba(16,185,129,0.1)" : "var(--warm)",
                color: status === s ? "var(--mid)" : "var(--grey)",
                fontFamily: "var(--font-jost), sans-serif",
              }}>
              {s || "All"}
            </button>
          ))}
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : (
        <DataTable columns={cols} rows={donations} empty="No donation records found." />
      )}

      {meta.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => load(p)} style={{
              width: 34, height: 34, borderRadius: 8,
              border: "1px solid var(--border)",
              background: p === meta.page ? "var(--deep)" : "var(--warm)",
              color: p === meta.page ? "var(--cream)" : "var(--grey)",
              fontSize: "0.78rem", cursor: "pointer",
            }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(6,14,10,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 440,
            boxShadow: "0 24px 80px rgba(6,78,56,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.6rem", fontWeight: 700, color: "var(--deep)", marginBottom: 20 }}>
              Donation Detail
            </h2>
            {[
              ["Donor",     selected.donor?.isAnonymous ? "Anonymous" : selected.donor?.fullName ?? "Unknown"],
              ["Email",     selected.donor?.email ?? "—"],
              ["Amount",    naira(selected.amount)],
              ["Status",    selected.paystackStatus],
              ["Reference", selected.paystackReference],
              ["Project",   selected.project?.title ?? "—"],
              ["Campaign",  selected.campaign?.title ?? "—"],
              ["Paid At",   fmtDate(selected.paidAt)],
              ["Currency",  selected.currency],
            ].map(([k, v]) => (
              <div key={String(k)} style={{ display: "flex", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "1px solid var(--border)", gap: 12 }}>
                <span style={{ fontSize: "0.68rem", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--mgrey)" }}>{k}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--deep)", fontWeight: 500,
                  textAlign: "right" }}>{String(v)}</span>
              </div>
            ))}
            <div style={{ marginTop: 24 }}>
              <ActionButton variant="ghost" onClick={() => setSelected(null)}>Close</ActionButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}