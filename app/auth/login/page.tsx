"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ElojeLogo from "@/app/components/ui/ElojeLogo";

/* ─────────────────────────────────────────────────────
   Eleje Legacy — Login Page
   POST /api/auth/login  →  { email, password }
   Success: stores accessToken, redirect to /dashboard
───────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");   // non-error feedback (e.g. resent link)
  const [mounted, setMounted]   = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",           // so the refreshToken cookie is stored
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // 403 = email not verified (info, not hard error)
        if (res.status === 403) {
          setInfo(data.message ?? "Please verify your email before logging in.");
        } else {
          setError(data.error ?? data.message ?? "Login failed. Please try again.");
        }
        return;
      }

      // Persist access token in memory / sessionStorage
      // (refresh token is stored in httpOnly cookie automatically)
      sessionStorage.setItem("accessToken", data.data.accessToken);

      router.push("/dashboard");
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
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "var(--cream)",
      }}
    >
      {/* ── Left panel — brand art ───────────────────────── */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, var(--ink) 0%, var(--deep) 45%, var(--emerald) 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--pale) 1px,transparent 1px),linear-gradient(90deg,var(--pale) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: -120,
            left: -80,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(52,211,153,0.13) 0%, transparent 65%)",
          }}
        />
        {/* Top glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: -60,
            right: -60,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 65%)",
          }}
        />

        {/* Logo mark */}
        <div className="relative z-10">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <ElojeLogo width={100} height={85} />
            <span
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--cream)",
                letterSpacing: "0.04em",
              }}
            >
              Eleje Legacy
            </span>
          </Link>
        </div>

        {/* Centre quote */}
        <div className="relative z-10 flex-1 flex flex-col justify-center" style={{ paddingTop: 60 }}>
          <div
            style={{
              width: 36,
              height: 3,
              background: "var(--gold)",
              marginBottom: 28,
              borderRadius: 2,
            }}
          />
          <blockquote
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.7rem, 2.4vw, 2.6rem)",
              fontWeight: 600,
              color: "var(--cream)",
              lineHeight: 1.18,
              maxWidth: 380,
            }}
          >
            Investing in people is the most{" "}
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>enduring legacy</em>{" "}
            of all.
          </blockquote>
          <p
            style={{
              marginTop: 22,
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "0.84rem",
              lineHeight: 1.85,
              color: "rgba(168,230,216,0.55)",
              maxWidth: 340,
            }}
          >
            Welcome back. Log in to manage your contributions, track impact, and help us build a better Nigeria.
          </p>
        </div>

        {/* Bottom stat strip */}
        <div
          className="relative z-10 flex gap-8"
          style={{ borderTop: "1px solid rgba(168,230,216,0.10)", paddingTop: 24 }}
        >
          {[
            { n: "340+", l: "Scholarships" },
            { n: "6",    l: "ECD Centres" },
            { n: "97%",  l: "Retention Rate" },
          ].map((s) => (
            <div key={s.l}>
              <div
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--pale)",
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "rgba(168,230,216,0.4)",
                  marginTop: 4,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ───────────────────────────── */}
      <div
        className="flex flex-col justify-center px-8 py-12 lg:px-16"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <svg width="26" height="30" viewBox="0 0 60 68" fill="var(--emerald)">
              <circle cx="38" cy="10" r="9" />
              <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
              <circle cx="16" cy="24" r="7.5" />
              <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
            </svg>
            {/* <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--deep)" }}>
              Eleje Legacy
            </span> */}
          </Link>
        </div>

        <div style={{ maxWidth: 420, width: "100%" }}>
          {/* Eyebrow */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            <div className="ey-dash" />
            <span className="ey-txt">Member Portal</span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 700,
              color: "var(--deep)",
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "0.88rem",
              color: "var(--grey)",
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Sign in to your account to continue.
          </p>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email address</label>
              <input
                ref={emailRef}
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

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={labelStyle}>Password</label>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--mid)",
                    letterSpacing: "0.06em",
                    transition: "color 0.2s",
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                  onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "var(--mgrey)",
                    lineHeight: 1,
                  }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && <AlertBox type="error"   message={error} />}
            {info  && <AlertBox type="info"    message={info}  />}

            {/* Submit */}
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
                transition: "background 0.2s, transform 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "var(--emerald)"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "var(--deep)"); }}
            >
              {loading ? <Spinner /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "28px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.66rem", color: "var(--mgrey)", letterSpacing: "0.1em" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--grey)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "var(--emerald)", fontWeight: 600, transition: "color 0.2s" }}
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ─────────────────────────── */

function AlertBox({ type, message }: { type: "error" | "info"; message: string }) {
  const isError = type === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      style={{
        padding: "11px 14px",
        borderRadius: 7,
        background: isError ? "rgba(185,28,28,0.06)" : "rgba(13,110,79,0.07)",
        border: `1px solid ${isError ? "rgba(185,28,28,0.18)" : "rgba(13,110,79,0.2)"}`,
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
      }}
    >
      {isError ? <ErrorIcon /> : <InfoIcon />}
      <span style={{ fontSize: "0.82rem", color: isError ? "#991b1b" : "var(--emerald)", lineHeight: 1.55 }}>
        {message}
      </span>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function EyeOn() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}

/* ── Styles ───────────────────────────────────────── */

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