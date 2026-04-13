"use client";

import { useState, useEffect, useCallback } from "react";
// import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  SectionHeader, DataTable, ActionButton, Panel,
  StatusBadge, LoadingDots, fmtDate,
} from "@/app/components/dashboard/DashboardUI";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";
import { Spinner } from "@/app/components/loading/Spinner";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<any[]>([]);
  const [meta, setMeta]     = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modal, setModal]   = useState<"create" | "role" | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const axiosPrivate = useAxiosPrivate();

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search)     params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const { data } = await axiosPrivate.get(`/api/admin/users?${params}`);
      setUsers(data.data);
      setMeta(data.meta);
    } catch { toast.error("Failed to load users."); }
    finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (u: any) => {
    if (!confirm(`Deactivate ${u.firstName} ${u.lastName}?`)) return;
    try {
      await axiosPrivate.delete(`/api/admin/users/${u.id}`);
      toast.success("User deactivated.");
      load();
    } catch { toast.error("Failed to deactivate user."); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await axiosPrivate.patch(`/api/admin/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}.`);
      setModal(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to update role.");
    }
  };

  const cols = [
    {
      key: "name", label: "Name",
      render: (u: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--deep), var(--emerald))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "0.85rem", fontWeight: 700, color: "var(--pale)",
          }}>
            {u.firstName?.[0]}{u.lastName?.[0]}
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>
              {u.firstName} {u.lastName}
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}>{u.email}</div>
          </div>
        </div>
      ),
    },
    { key: "role", label: "Role", render: (u: any) => <StatusBadge status={u.role} /> },
    {
      key: "status", label: "Status",
      render: (u: any) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <StatusBadge status={u.isActive ? "ACTIVE" : "PAUSED"} />
          {!u.emailVerified && (
            <span style={{ fontSize: "0.56rem", color: "var(--gold)", letterSpacing: "0.12em" }}>
              UNVERIFIED
            </span>
          )}
        </div>
      ),
    },
    {
      key: "content", label: "Content",
      render: (u: any) => (
        <span style={{ fontSize: "0.75rem", color: "var(--grey)" }}>
          {u._count?.blogs ?? 0}B · {u._count?.projects ?? 0}P · {u._count?.investments ?? 0}I
        </span>
      ),
    },
    { key: "createdAt", label: "Joined", render: (u: any) => <span style={{ fontSize: "0.75rem", color: "var(--mgrey)" }}>{fmtDate(u.createdAt)}</span> },
    {
      key: "actions", label: "Actions",
      render: (u: any) => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => { setSelected(u); setModal("role"); }}
            style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase",
              color: "var(--mid)", background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)", borderRadius: 6,
              padding: "4px 10px", cursor: "pointer" }}
          >
            Role
          </button>
          {u.isActive && (
            <button
              onClick={() => handleDeactivate(u)}
              style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#dc2626", background: "rgba(220,38,38,0.07)",
                border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6,
                padding: "4px 10px", cursor: "pointer" }}
            >
              Deactivate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <SectionHeader
        label="Admin"
        title="User Management"
        action={<ActionButton onClick={() => setModal("create")}>+ Invite User</ActionButton>}
      />

      {/* Filters */}
      <Panel style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            style={{
              flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--warm)",
              fontSize: "0.82rem", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif",
              outline: "none",
            }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: "9px 14px", borderRadius: 8,
              border: "1px solid var(--border)", background: "var(--warm)",
              fontSize: "0.78rem", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif",
              cursor: "pointer", outline: "none",
            }}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="INVESTOR">Investor</option>
          </select>
          <span style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>
            {meta.total} total
          </span>
        </div>
      </Panel>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><LoadingDots /></div>
      ) : (
        <DataTable columns={cols} rows={users} empty="No users found." />
      )}

      {/* Pagination */}
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

      {/* ── Create User Modal ── */}
      {modal === "create" && <CreateUserModal onClose={() => { setModal(null); load(); }} />}

      {/* ── Role Change Modal ── */}
      {modal === "role" && selected && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(6,14,10,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400,
            boxShadow: "0 24px 80px rgba(6,78,56,0.2)",
          }}>
            <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.5rem", fontWeight: 700, color: "var(--deep)", marginBottom: 8 }}>
              Change Role
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--grey)", marginBottom: 24 }}>
              Updating role for <strong>{selected.firstName} {selected.lastName}</strong>. Their current session will be invalidated.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {["STAFF", "INVESTOR"].map(r => (
                <button key={r} onClick={() => handleRoleChange(selected.id, r)}
                  style={{
                    padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${selected.role === r ? "var(--mid)" : "var(--border)"}`,
                    background: selected.role === r ? "rgba(16,185,129,0.08)" : "var(--warm)",
                    textAlign: "left", display: "flex", justifyContent: "space-between",
                    alignItems: "center", fontFamily: "var(--font-jost), sans-serif",
                  }}
                >
                  <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>{r}</span>
                  {selected.role === r && <span style={{ fontSize: "0.62rem", color: "var(--mid)" }}>Current</span>}
                </button>
              ))}
            </div>
            <ActionButton variant="ghost" onClick={() => setModal(null)}>Cancel</ActionButton>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* ── Create User Modal ── */
function CreateUserModal({ onClose }: { onClose: () => void }) {
  const axiosPrivate = useAxiosPrivate()
  const [form, setForm]     = useState({ firstName: "", lastName: "", email: "", password: "", role: "STAFF" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.warning("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await axiosPrivate.post("/api/admin/users", form);
      toast.success("User created successfully.");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to create user.");
    } finally { setLoading(false); }
  };

  const Field = ({ label, name, type = "text", placeholder }: any) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={form[name as keyof typeof form]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 8,
          border: "1px solid var(--border)", background: "var(--warm)",
          fontSize: "0.85rem", color: "var(--ink)",
          fontFamily: "var(--font-jost), sans-serif", outline: "none",
        }}
      />
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6,14,10,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 440,
        boxShadow: "0 24px 80px rgba(6,78,56,0.2)",
      }}>
        <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.6rem", fontWeight: 700, color: "var(--deep)", marginBottom: 4 }}>
          Invite New User
        </h2>
        <p style={{ fontSize: "0.78rem", color: "var(--grey)", marginBottom: 24 }}>
          Account is pre-verified. No email confirmation required.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="First Name" name="firstName" placeholder="Ada" />
          <Field label="Last Name"  name="lastName"  placeholder="Okafor" />
        </div>
        <Field label="Email Address" name="email" type="email" placeholder="ada@example.com" />
        <Field label="Password"      name="password" type="password" placeholder="Min. 8 characters" />

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--grey)", marginBottom: 6 }}>
            Role
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["STAFF", "INVESTOR"].map(r => (
              <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                className="rbtn" style={{
                  borderColor: form.role === r ? "var(--mid)" : undefined,
                  background: form.role === r ? "var(--warm2)" : undefined,
                }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--deep)" }}>{r}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <ActionButton onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner /> : null} Create User
          </ActionButton>
          <ActionButton variant="ghost" onClick={onClose}>Cancel</ActionButton>
        </div>
      </div>
    </div>
  );
}