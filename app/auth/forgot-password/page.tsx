"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ElojeLogo from "@/app/components/ui/ElojeLogo";

/* ─────────────────────────────────────────────────────
   Eleje Legacy — Forgot Password Page
   POST /api/auth/forgot-password  →  { email }
   API always returns 200 (anti-enumeration).
───────────────────────────────────────────────────── */

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      // The API always returns 200 so we always show the success state
      // (avoids leaking whether the email exists)
      await res.json();
      setSent(true);
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
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
          top: -160,
          right: -160,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,110,79,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage:
            "linear-gradient(var(--ink) 1px,transparent 1px),linear-gradient(90deg,var(--ink) 1px,transparent 1px)",
          backgroundSize: "52px 52px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 20px 60px var(--shadow)",
          padding: "48px 44px",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Brand top */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 24 }}>
            <ElojeLogo width={100} height={85} />
            {/* <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--deep)" }}>
              Eleje Legacy
            </span> */}
          </Link>

          {!sent ? (
            <>
              {/* Lock icon */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "rgba(13,110,79,0.07)",
                  border: "1px solid rgba(13,110,79,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.9rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.1, marginBottom: 8 }}>
                Reset your password
              </h1>
              <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.86rem", color: "var(--grey)", lineHeight: 1.75 }}>
                Enter the email address linked to your account and we&apos;ll send you a secure link.
              </p>
            </>
          ) : (
            <SentState email={email} />
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
              />
            </div>

            {error && (
              <div role="alert" style={{ padding: "11px 14px", borderRadius: 7, background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.18)", display: "flex", alignItems: "flex-start", gap: 9 }}>
                <ErrorIcon />
                <span style={{ fontSize: "0.82rem", color: "#991b1b", lineHeight: 1.55 }}>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 28px",
                background: loading ? "var(--mgrey)" : "var(--deep)",
                color: "var(--cream)",
                border: "none",
                borderRadius: 5,
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "var(--emerald)"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "var(--deep)"); }}
            >
              {loading && <Spinner />}
              {loading ? "Sending link…" : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Footer nav */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 22,
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <Link href="/login" style={{ fontSize: "0.78rem", color: "var(--mid)", display: "flex", alignItems: "center", gap: 5, transition: "color 0.2s" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to login
          </Link>
          <Link href="/register" style={{ fontSize: "0.78rem", color: "var(--mid)", transition: "color 0.2s" }}>
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

function SentState({ email }: { email: string }) {
  return (
    <div>
      {/* Envelope icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(13,110,79,0.08)",
          border: "1px solid rgba(13,110,79,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.12, marginBottom: 10 }}>
        Check your inbox
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.86rem", color: "var(--grey)", lineHeight: 1.75, marginBottom: 6 }}>
        If <strong style={{ color: "var(--deep)" }}>{email}</strong> is registered, you&apos;ll receive a password reset link within a few minutes.
      </p>
      <p style={{ fontSize: "0.74rem", color: "var(--mgrey)", lineHeight: 1.65 }}>
        Didn&apos;t receive it? Check your spam folder, or wait 5 minutes before requesting again.
      </p>
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────── */
function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function ErrorIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 7,
  fontSize: "0.7rem",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--grey)",
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "13px 14px",
  border: "1px solid var(--border)",
  borderRadius: 6,
  background: "var(--warm)",
  color: "var(--ink)",
  fontFamily: "var(--font-jost), sans-serif",
  fontSize: "0.9rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const inputFocusStyle: React.CSSProperties = {
  ...inputStyle,
  borderColor: "var(--mid)",
  boxShadow: "0 0 0 3px rgba(13,110,79,0.08)",
};