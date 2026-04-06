"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ElojeLogo from "@/app/components/ui/ElojeLogo";

/* ─────────────────────────────────────────────────────
   Eleje Legacy — Verify Email Page
   URL params: ?userId=...&token=...
   GET /api/auth/verify-email?userId=...&token=...
   This page calls the API automatically on mount.
───────────────────────────────────────────────────── */

type Status = "pending" | "verifying" | "success" | "already" | "error";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const token  = searchParams.get("token")  ?? "";

  const [status,  setStatus]  = useState<Status>("pending");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!userId || !token) {
      setStatus("error");
      setMessage("This verification link is incomplete. Please check your email for the correct link.");
      return;
    }

    setStatus("verifying");

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?userId=${encodeURIComponent(userId)}&token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          setStatus("error");
          setMessage(data.error ?? data.message ?? "Invalid or expired verification link.");
          return;
        }

        // API returns 200 + message "Email already verified" for already-verified accounts
        if (data.message?.toLowerCase().includes("already")) {
          setStatus("already");
        } else {
          setStatus("success");
        }
        setMessage(data.message ?? "");
      } catch {
        setStatus("error");
        setMessage("A network error occurred. Please try again.");
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream)",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,110,79,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: "radial-gradient(var(--ink) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 18,
          border: "1px solid var(--border)",
          boxShadow: "0 24px 64px var(--shadow)",
          padding: "52px 48px",
          textAlign: "center",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(22px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 36 }}>
          <ElojeLogo width={100} height={85} />
          {/* <svg width="28" height="32" viewBox="0 0 60 68" fill="var(--emerald)">
            <circle cx="38" cy="10" r="9" />
            <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
            <circle cx="16" cy="24" r="7.5" />
            <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
          </svg>
          <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.12rem", fontWeight: 700, color: "var(--deep)" }}>
            Eleje Legacy
          </span> */}
        </Link>

        {/* Content by status */}
        {status === "verifying" || status === "pending" ? (
          <VerifyingState />
        ) : status === "success" ? (
          <SuccessState />
        ) : status === "already" ? (
          <AlreadyVerifiedState />
        ) : (
          <ErrorState message={message} userId={userId} />
        )}
      </div>

      {/* Bottom note */}
      <p
        style={{
          position: "relative",
          zIndex: 10,
          marginTop: 28,
          fontSize: "0.72rem",
          color: "var(--mgrey)",
          letterSpacing: "0.06em",
        }}
      >
        Need help?{" "}
        <Link href="/contact" style={{ color: "var(--mid)", textDecoration: "underline" }}>
          Contact us
        </Link>
      </p>
    </div>
  );
}

/* ── State screens ─────────────────────────────────── */

function VerifyingState() {
  return (
    <div>
      {/* Animated ring */}
      <div
        style={{
          width: 72,
          height: 72,
          margin: "0 auto 28px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes pulse-ring {
            0%   { transform: scale(0.85); opacity: 0.5; }
            50%  { transform: scale(1);    opacity: 0.15; }
            100% { transform: scale(0.85); opacity: 0.5; }
          }
        `}</style>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1px solid rgba(13,110,79,0.2)",
            animation: "pulse-ring 2s ease infinite",
          }}
        />
        <svg
          width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--mid)" strokeWidth="2"
          style={{ animation: "spin 1.2s linear infinite" }}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.85rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.12, marginBottom: 10 }}>
        Verifying your email…
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.86rem", color: "var(--grey)", lineHeight: 1.75 }}>
        Please wait while we confirm your email address. This only takes a moment.
      </p>
    </div>
  );
}

function SuccessState() {
  return (
    <div>
      {/* Checkmark with animated circle */}
      <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 28px" }}>
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
          @keyframes checkDraw {
            from { stroke-dashoffset: 30; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(13,110,79,0.09)",
            border: "1px solid rgba(13,110,79,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2.5" strokeLinecap="round">
            <polyline
              points="20 6 9 17 4 12"
              strokeDasharray="30"
              strokeDashoffset="30"
              style={{ animation: "checkDraw 0.4s 0.2s ease forwards" }}
            />
          </svg>
        </div>
      </div>

      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.1, marginBottom: 12 }}>
        Email verified!
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.88rem", color: "var(--grey)", lineHeight: 1.8, marginBottom: 28 }}>
        Your account is now active. Welcome to the Eleje Legacy community — every contribution you make plants a seed of lasting change.
      </p>

      {/* CTA strip */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "14px 28px",
            background: "var(--deep)",
            color: "var(--cream)",
            borderRadius: 5,
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--emerald)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--deep)")}
        >
          Sign in to your account →
        </Link>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 28px",
            border: "1px solid var(--border)",
            color: "var(--grey)",
            borderRadius: 5,
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--mid)"; (e.currentTarget as HTMLElement).style.color = "var(--mid)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--grey)"; }}
        >
          Explore the site
        </Link>
      </div>
    </div>
  );
}

function AlreadyVerifiedState() {
  return (
    <div>
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 8 12 12 14 14"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.9rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.1, marginBottom: 10 }}>
        Already verified
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.87rem", color: "var(--grey)", lineHeight: 1.75, marginBottom: 26 }}>
        Your email address has already been confirmed. You can log straight in.
      </p>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "13px 26px",
          background: "var(--deep)",
          color: "var(--cream)",
          borderRadius: 5,
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.7rem",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        Go to login →
      </Link>
    </div>
  );
}

function ErrorState({ message, userId }: { message: string; userId: string }) {
  return (
    <div>
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.9rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.1, marginBottom: 10 }}>
        Verification failed
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.87rem", color: "var(--grey)", lineHeight: 1.75, marginBottom: 6 }}>
        {message || "This link may have expired or already been used."}
      </p>
      <p style={{ fontSize: "0.78rem", color: "var(--mgrey)", lineHeight: 1.65, marginBottom: 26 }}>
        Verification links expire after <strong>1 hour</strong>. Log in with your credentials and we&apos;ll send a fresh link.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "13px 26px",
            background: "var(--deep)",
            color: "var(--cream)",
            borderRadius: 5,
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Go to login — get new link →
        </Link>
        <Link
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 26px",
            border: "1px solid var(--border)",
            color: "var(--grey)",
            borderRadius: 5,
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}