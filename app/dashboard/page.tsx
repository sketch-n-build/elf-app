"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/useUserStore";
import { LoadingDots } from "../components/dashboard/DashboardUI";
// import { LoadingDots } from "@/components/dashboard/DashboardUI";

/* ─────────────────────────────────────────────────────────────────────
   /dashboard  — Role-aware redirect
   ADMIN    → /dashboard/admin
   STAFF    → /dashboard/staff
   INVESTOR → /dashboard/investor

   If no user is found (not logged in), redirect to /login.
───────────────────────────────────────────────────────────────────── */
export default function DashboardRootPage() {

  const router    = useRouter();
  const { user }  = useUserStore();

  console.log("Dashboard user", user)

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login?from=/dashboard");
      return;
    }

    const destinations: Record<string, string> = {
      ADMIN:    "/dashboard/admin",
      STAFF:    "/dashboard/staff",
      INVESTOR: "/dashboard/investor",
    };

    router.replace(destinations[user.role] ?? "/dashboard/staff");
  }, [user, router]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", background: "var(--cream)",
    }}>
      <div style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "1.4rem", fontWeight: 700, color: "var(--deep)",
        marginBottom: 20,
      }}>
        Eleje Legacy
      </div>
      <LoadingDots />
      <p style={{ marginTop: 16, fontSize: "0.75rem", color: "var(--mgrey)",
        letterSpacing: "0.12em" }}>
        Preparing your dashboard…
      </p>
    </div>
  );
}