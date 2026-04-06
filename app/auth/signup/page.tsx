"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ElojeLogo from "@/app/components/ui/ElojeLogo";

/* ─────────────────────────────────────────────────────
   Eleje Legacy — Register Page
   POST /api/auth/register  →  { email, password, firstName, lastName }
   Success: redirect to /login with ?registered=1
───────────────────────────────────────────────────── */

type Field = "firstName" | "lastName" | "email" | "password" | "confirm";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<Record<Field, string>>({
    firstName: "",
    lastName:  "",
    email:     "",
    password:  "",
    confirm:   "",
  });
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [mounted,   setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const pwStrength = getPwStrength(form.password);

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(form.password)) {
      setError("Password must contain letters, numbers and be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:     form.email.trim().toLowerCase(),
          password:  form.password,
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      // After 3s redirect to login
      setTimeout(() => router.push("/login?registered=1"), 3200);
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
      {/* ── Left decorative panel ───────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: "linear-gradient(155deg, var(--deep) 0%, #0a3d29 50%, #0d5238 100%)",
        }}
      >
        {/* Pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(52,211,153,0.07) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(201,168,76,0.06) 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(var(--pale) 1px,transparent 1px),linear-gradient(90deg,var(--pale) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <ElojeLogo width={100} height={85} />
            {/* <svg width="34" height="38" viewBox="0 0 60 68" fill="var(--glow)">
              <circle cx="38" cy="10" r="9" />
              <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
              <circle cx="16" cy="24" r="7.5" />
              <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
            </svg>
            <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--cream)", letterSpacing: "0.04em" }}>
              Eleje Legacy
            </span> */}
          </Link>
        </div>

        {/* Benefits */}
        <div className="relative z-10 flex-1 flex flex-col justify-center" style={{ paddingTop: 40 }}>
          <div style={{ width: 36, height: 3, background: "var(--gold)", marginBottom: 28, borderRadius: 2 }} />
          <h2
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.6rem, 2.2vw, 2.4rem)",
              fontWeight: 600,
              color: "var(--cream)",
              lineHeight: 1.15,
              marginBottom: 36,
            }}
          >
            Join the{" "}
            <em style={{ color: "var(--glow)", fontStyle: "italic" }}>circle of impact</em>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: "🌱", title: "Track your contributions", desc: "See exactly how your investment changes lives in real time." },
              { icon: "📊", title: "Impact dashboard",         desc: "Personalised reports on scholarships, health visits and more." },
              { icon: "🤝", title: "Community of changemakers", desc: "Connect with like-minded donors building a lasting legacy." },
            ].map((b) => (
              <div key={b.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: "rgba(52,211,153,0.10)",
                    border: "1px solid rgba(52,211,153,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                    flexShrink: 0,
                  }}
                >
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.82rem", fontWeight: 600, color: "var(--pale)", marginBottom: 3 }}>
                    {b.title}
                  </div>
                  <div style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.78rem", color: "rgba(168,230,216,0.5)", lineHeight: 1.6 }}>
                    {b.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10" style={{ borderTop: "1px solid rgba(168,230,216,0.10)", paddingTop: 22 }}>
          <p style={{ fontSize: "0.72rem", color: "rgba(168,230,216,0.35)", lineHeight: 1.6 }}>
            Your data is protected and never shared.<br />We will never spam you.
          </p>
        </div>
      </div>

      {/* ── Right — form ─────────────────────────────────── */}
      <div
        className="flex flex-col justify-center px-8 py-10 lg:px-14 overflow-y-auto"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
        }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <svg width="26" height="30" viewBox="0 0 60 68" fill="var(--emerald)">
              <circle cx="38" cy="10" r="9" />
              <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
              <circle cx="16" cy="24" r="7.5" />
              <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
            </svg>
            <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--deep)" }}>Eleje Legacy</span>
          </Link>
        </div>

        <div style={{ maxWidth: 430, width: "100%" }}>
          {success ? (
            <SuccessState />
          ) : (
            <>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                <div className="ey-dash" />
                <span className="ey-txt">Create Account</span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "clamp(1.9rem, 2.8vw, 2.5rem)",
                  fontWeight: 700,
                  color: "var(--deep)",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                Start your legacy
              </h1>
              <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.87rem", color: "var(--grey)", lineHeight: 1.7, marginBottom: 30 }}>
                Join thousands of Nigerians investing in meaningful change.
              </p>

              <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Name row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <input type="text" value={form.firstName} onChange={set("firstName")} placeholder="Amara" required autoComplete="given-name"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <input type="text" value={form.lastName} onChange={set("lastName")} placeholder="Okonkwo" required autoComplete="family-name"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email address</label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPw ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="At least 6 chars with letters & numbers" required autoComplete="new-password"
                      style={{ ...inputStyle, paddingRight: 44 }}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--mgrey)" }}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff /> : <EyeOn />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {form.password && <PwStrengthBar strength={pwStrength} />}
                </div>

                {/* Confirm */}
                <div>
                  <label style={labelStyle}>Confirm password</label>
                  <input type={showPw ? "text" : "password"} value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" required autoComplete="new-password"
                    style={{
                      ...inputStyle,
                      borderColor: form.confirm && form.confirm !== form.password ? "rgba(185,28,28,0.45)" : undefined,
                    }}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e)  => Object.assign(e.target.style, inputStyle)}
                  />
                  {form.confirm && form.confirm !== form.password && (
                    <p style={{ marginTop: 5, fontSize: "0.72rem", color: "#991b1b" }}>Passwords do not match</p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div role="alert" style={{ padding: "11px 14px", borderRadius: 7, background: "rgba(185,28,28,0.06)", border: "1px solid rgba(185,28,28,0.18)", display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <ErrorIcon />
                    <span style={{ fontSize: "0.82rem", color: "#991b1b", lineHeight: 1.55 }}>{error}</span>
                  </div>
                )}

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
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.82rem", color: "var(--grey)" }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--emerald)", fontWeight: 600 }}>Sign in →</Link>
              </p>

              <p style={{ marginTop: 18, textAlign: "center", fontSize: "0.68rem", color: "var(--mgrey)", lineHeight: 1.7 }}>
                By creating an account you agree to our{" "}
                <Link href="/terms" style={{ color: "var(--mid)", textDecoration: "underline" }}>Terms</Link>
                {" & "}
                <Link href="/privacy" style={{ color: "var(--mid)", textDecoration: "underline" }}>Privacy Policy</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Success state ─────────────────────────────────── */
function SuccessState() {
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "rgba(13,110,79,0.08)",
          border: "1px solid rgba(13,110,79,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 22px",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "var(--deep)", marginBottom: 10 }}>
        Account created!
      </h2>
      <p style={{ fontFamily: "var(--font-lora), Georgia, serif", fontSize: "0.9rem", color: "var(--grey)", lineHeight: 1.75, maxWidth: 340, margin: "0 auto 22px" }}>
        We&apos;ve sent a verification link to your email. Please click it to activate your account before logging in.
      </p>
      <p style={{ fontSize: "0.72rem", color: "var(--mgrey)", letterSpacing: "0.1em" }}>
        Redirecting you to login…
      </p>
    </div>
  );
}

/* ── Password strength ─────────────────────────────── */
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
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= strength ? colors[strength] : "var(--border)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p style={{ marginTop: 4, fontSize: "0.66rem", color: colors[strength], letterSpacing: "0.08em" }}>
          {labels[strength]}
        </p>
      )}
    </div>
  );
}

/* ── Tiny helpers ──────────────────────────────────── */
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