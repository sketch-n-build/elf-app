"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ElojeLogo from "@/app/components/ui/ElojeLogo";
import { useUserStore } from "@/app/store/useUserStore";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { toast } from "react-toastify";

/* ── Icon components ─────────────────────────────────────────── */
const Icon = {
  Grid:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Projects:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/><path d="M8 6V4"/><path d="M16 6V4"/><path d="M2 10h20"/></svg>,
  Blog:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>,
  Donation:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 6v6l4 2"/></svg>,
  Users:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Campaign:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Investment: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>,
  Portfolio:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>,
  Explore:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Bell:       () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  Logout:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  X:          () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Donors:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
};

type NavItem = { label: string; href: string; icon: () => React.ReactNode };

const navByRole: Record<string, NavItem[]> = {
  ADMIN: [
    { label: "Overview",    href: "/dashboard/admin",             icon: Icon.Grid },
    { label: "Projects",    href: "/dashboard/admin/projects",    icon: Icon.Projects },
    { label: "Blog",        href: "/dashboard/admin/blogs",       icon: Icon.Blog },
    { label: "Donations",   href: "/dashboard/admin/donations",   icon: Icon.Donation },
    { label: "Donors",      href: "/dashboard/admin/donors",      icon: Icon.Donors },
    { label: "Campaigns",   href: "/dashboard/admin/campaigns",   icon: Icon.Campaign },
    { label: "Investments", href: "/dashboard/admin/investments", icon: Icon.Investment },
    { label: "Users",       href: "/dashboard/admin/users",       icon: Icon.Users },
  ],
  STAFF: [
    { label: "Overview",   href: "/dashboard/staff",          icon: Icon.Grid },
    { label: "My Projects", href: "/dashboard/staff/projects", icon: Icon.Projects },
    { label: "My Blog",    href: "/dashboard/staff/blogs",    icon: Icon.Blog },
  ],
  INVESTOR: [
    { label: "Overview",   href: "/dashboard/investor",             icon: Icon.Grid },
    { label: "Portfolio",  href: "/dashboard/investor/portfolio",   icon: Icon.Portfolio },
    { label: "Explore",    href: "/dashboard/investor/explore",     icon: Icon.Explore },
  ],
};

const roleColors: Record<string, string> = {
  ADMIN:    "var(--gold)",
  STAFF:    "var(--mid)",
  INVESTOR: "var(--glow)",
};

interface Props { children: React.ReactNode }

export default function DashboardLayout({ children }: Props) {
  const pathname          = usePathname();
  const router            = useRouter();
  const { user, clearUser } = useUserStore();
  const [open, setOpen]   = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const role = user?.role ?? "STAFF";
  const nav  = navByRole[role] ?? navByRole.STAFF;

  // Close sidebar on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axiosPrivate.post("/api/auth/logout");
    } catch { /* ignore */ }
    clearUser();
    toast.success("Signed out.");
    router.push("/auth/login");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--warm)" }}>

      {/* ── Mobile overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(6,14,10,0.55)",
            backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          background: "var(--ink)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0, bottom: 0, left: 0,
          zIndex: 50,
          transform: open ? "translateX(0)" : undefined,
          transition: "transform 0.28s cubic-bezier(.4,0,.2,1)",
          borderRight: "1px solid rgba(168,230,216,0.06)",
        }}
        className={`lg:translate-x-0 ${open ? "" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(168,230,216,0.07)" }}>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <ElojeLogo width={36} height={31} />
            <div>
              <div style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "0.95rem", fontWeight: 700,
                color: "var(--cream)", letterSpacing: "0.04em",
                lineHeight: 1,
              }}>
                Eleje Legacy
              </div>
              <div style={{
                fontSize: "0.52rem", letterSpacing: "0.3em",
                textTransform: "uppercase", color: "rgba(168,230,216,0.35)",
                marginTop: 2,
              }}>
                {role} PORTAL
              </div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "18px 12px", overflowY: "auto" }}>
          <div style={{ fontSize: "0.52rem", letterSpacing: "0.32em", textTransform: "uppercase",
            color: "rgba(168,230,216,0.25)", marginBottom: 10, paddingLeft: 8 }}>
            Navigation
          </div>
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 8, marginBottom: 3,
                  fontSize: "0.78rem", fontWeight: active ? 500 : 400,
                  letterSpacing: "0.02em",
                  color: active ? "var(--pale)" : "rgba(168,230,216,0.45)",
                  background: active ? "rgba(168,230,216,0.08)" : "transparent",
                  borderLeft: active ? `2px solid var(--glow)` : "2px solid transparent",
                  transition: "all 0.18s",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(168,230,216,0.04)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(168,230,216,0.7)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "rgba(168,230,216,0.45)";
                  }
                }}
              >
                <item.icon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User block */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(168,230,216,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px",
            background: "rgba(168,230,216,0.05)", borderRadius: 10, marginBottom: 8 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, var(--deep), var(--emerald))`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "0.9rem", fontWeight: 700, color: "var(--pale)",
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--cream)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase",
                color: roleColors[role] ?? "var(--mid)", marginTop: 1 }}>
                {role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} disabled={loggingOut}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "9px 10px", borderRadius: 8, border: "none",
              background: "transparent", cursor: "pointer", transition: "background 0.18s",
              color: "rgba(168,230,216,0.35)", fontSize: "0.75rem",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,0.1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Icon.Logout />
            {loggingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0, marginLeft: open ? 0 : 240, }} className="lg:ml-[240px]">

        {/* Top bar */}
        <header style={{
          height: 60, position: "sticky", top: 0, zIndex: 30,
          background: "rgba(250,246,239,0.88)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px",
        }}>
          <button className="lg:hidden" onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 4 }}>
            <Icon.Menu />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex" style={{ alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--mgrey)" }}>
              {role} Dashboard
            </span>
            <span style={{ color: "var(--border)" }}>›</span>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.18em", textTransform: "uppercase",
              color: "var(--mid)", fontWeight: 500 }}>
              {nav.find(n => n.href === pathname)?.label ?? "Overview"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
            {/* Role badge */}
            <span style={{
              fontSize: "0.58rem", letterSpacing: "0.22em", textTransform: "uppercase",
              padding: "4px 10px", borderRadius: 20,
              background: role === "ADMIN" ? "rgba(201,168,76,0.12)"
                        : role === "INVESTOR" ? "rgba(52,211,153,0.1)"
                        : "rgba(16,185,129,0.1)",
              color: roleColors[role],
              border: `1px solid ${roleColors[role]}33`,
            }}>
              {role}
            </span>
            <Link href="/dashboard/profile"
              style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--deep), var(--emerald))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "0.88rem", fontWeight: 700, color: "var(--pale)",
                flexShrink: 0,
              }}>
              {initials}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: "28px 24px 48px", maxWidth: 1200, width: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}