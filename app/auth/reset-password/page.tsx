"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ElojeLogo from "@/app/components/ui/ElojeLogo";

/* ─────────────────────────────────────────────────────
   Eleje Legacy — Reset Password Page
   URL params: ?userId=...&token=...
   POST /api/auth/reset-password  →  { userId, token, newPassword }
───────────────────────────────────────────────────── */

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId") ?? "";
  const token  = searchParams.get("token")  ?? "";

  const [password, setPassword]   = useState("");
  const [confirm,  setConfirm]    = useState("");
  const [showPw,   setShowPw]     = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [success,  setSuccess]    = useState(false);
  const [error,    setError]      = useState("");
  const [mounted,  setMounted]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  // Guard: missing params
  const invalidLink = !userId || !token;

  const pwStrength = getPwStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      setError("Password must contain letters, numbers and be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "Invalid or expired reset link. Please request a new one.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 3000);
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
      {/* Background blobs */}
      <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,110,79,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 470,
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
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 26 }}>
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

          {success ? (
            <SuccessState />
          ) : invalidLink ? (
            <InvalidState />
          ) : (
            <>
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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.9rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.1, marginBottom: 8 }}>
                Set new password
              </h1>
              <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.86rem", color: "var(--grey)", lineHeight: 1.75 }}>
                Choose a strong password you haven&apos;t used before.
              </p>
            </>
          )}
        </div>

        {/* Form — only shown when link is valid and not yet successful */}
        {!success && !invalidLink && (
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* New password */}
            <div>
              <label style={labelStyle}>New password</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={inputRef}
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars with letters & numbers"
                  required
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--mgrey)" }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {password && <PwStrengthBar strength={pwStrength} />}
            </div>

            {/* Confirm */}
            <div>
              <label style={labelStyle}>Confirm new password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                autoComplete="new-password"
                style={{
                  ...inputStyle,
                  borderColor: confirm && confirm !== password ? "rgba(185,28,28,0.45)" : undefined,
                }}
                onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
              />
              {confirm && confirm !== password && (
                <p style={{ marginTop: 5, fontSize: "0.72rem", color: "#991b1b" }}>Passwords do not match</p>
              )}
            </div>

            {/* Requirements hint */}
            <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--warm)", border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--mgrey)", marginBottom: 8 }}>Requirements</p>
              {[
                { label: "At least 6 characters",        met: password.length >= 6 },
                { label: "Contains letters and numbers", met: /[A-Za-z]/.test(password) && /\d/.test(password) },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: r.met ? "rgba(13,110,79,0.12)" : "var(--border)",
                    border: `1px solid ${r.met ? "rgba(13,110,79,0.3)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}>
                    {r.met && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: "0.74rem", color: r.met ? "var(--emerald)" : "var(--grey)", transition: "color 0.2s" }}>{r.label}</span>
                </div>
              ))}
            </div>

            {/* Error */}
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
                marginTop: 4,
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
              {loading ? "Saving password…" : "Reset Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <Link href="/auth/login" style={{ fontSize: "0.78rem", color: "var(--mid)", display: "inline-flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── States ─────────────────────────────────────────── */
function SuccessState() {
  return (
    <div>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(13,110,79,0.08)", border: "1px solid rgba(13,110,79,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.85rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.12, marginBottom: 10 }}>
        Password updated!
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.87rem", color: "var(--grey)", lineHeight: 1.75, marginBottom: 6 }}>
        Your password has been reset successfully. All previous sessions have been revoked.
      </p>
      <p style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}>Redirecting to login…</p>
    </div>
  );
}

function InvalidState() {
  return (
    <div>
      <div style={{ width: 58, height: 58, borderRadius: "50%", background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--deep)", lineHeight: 1.12, marginBottom: 10 }}>
        Invalid link
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.87rem", color: "var(--grey)", lineHeight: 1.75, marginBottom: 20 }}>
        This password reset link is missing required parameters. Please request a new one.
      </p>
      <Link
        href="/auth/forgot-password"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "12px 22px",
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
        Request new link →
      </Link>
    </div>
  );
}

/* ── PW strength ───────────────────────────────────── */
function getPwStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6)              score++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) score++;
  if (pw.length >= 10 && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

function PwStrengthBar({ strength }: { strength: 0 | 1 | 2 | 3 }) {
  const labels = ["", "Weak", "Fair", "Strong"];
  const colors = ["", "#b91c1c", "var(--gold)", "var(--mid)"];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 5 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength] : "var(--border)", transition: "background 0.3s" }} />
        ))}
      </div>
      {strength > 0 && <p style={{ marginTop: 4, fontSize: "0.66rem", color: colors[strength], letterSpacing: "0.08em" }}>{labels[strength]}</p>}
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

function EyeOn() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function EyeOff() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>;
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