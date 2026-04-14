"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import ElojeLogo from "@/app/components/ui/ElojeLogo";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";
import { Spinner } from "@/app/components/loading/Spinner";

type Field = "firstName" | "lastName" | "email" | "password" | "confirm";

export default function SignupPage() {
  const router  = useRouter();
  const axiosPrivate = useAxiosPrivate();
  const [form, setForm] = useState<Record<Field, string>>({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [f]: e.target.value }));

  const pwStrength = getPwStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(form.password)) { toast.error("Password must contain letters, numbers and be at least 6 characters."); return; }

    setLoading(true);
    try {
      await axiosPrivate.post("/api/auth/register", {
        email:     form.email.trim().toLowerCase(),
        password:  form.password,
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
      });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login?registered=1"), 3200);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (axios.isAxiosError(err) && !err.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(msg ?? "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--cream)]">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, var(--deep) 0%, #0a3d29 50%, #0d5238 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--pale) 1px,transparent 1px),linear-gradient(90deg,var(--pale) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(52,211,153,0.07) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(201,168,76,0.06) 0%, transparent 50%)" }} />

        {/* <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <ElojeLogo width={100} height={85} />
          </Link>
        </div> */}

        <div className="relative z-10 flex-1 flex flex-col justify-center pt-10">
          <div className="w-9 h-[3px] rounded-sm mb-7" style={{ background: "var(--gold)" }} />
          <h2 className="font-[var(--font-cormorant)] font-semibold leading-tight mb-9" style={{ fontSize: "clamp(1.6rem,2.2vw,2.4rem)", color: "var(--cream)" }}>
            Join the <em className="italic" style={{ color: "var(--glow)" }}>circle of impact</em>
          </h2>
          <div className="flex flex-col gap-5">
            {[
              { icon: "🌱", title: "Track your contributions", desc: "See exactly how your investment changes lives in real time." },
              { icon: "📊", title: "Impact dashboard",         desc: "Personalised reports on scholarships, health visits and more." },
              { icon: "🤝", title: "Community of changemakers", desc: "Connect with like-minded donors building a lasting legacy." },
            ].map((b) => (
              <div key={b.title} className="flex gap-3.5 items-start">
                <div className="w-[38px] h-[38px] flex-shrink-0 rounded-[9px] flex items-center justify-center text-base" style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.18)" }}>{b.icon}</div>
                <div>
                  <div className="text-[0.82rem] font-semibold mb-0.5" style={{ color: "var(--pale)", fontFamily: "var(--font-jost), sans-serif" }}>{b.title}</div>
                  <div className="text-[0.78rem] leading-relaxed" style={{ color: "rgba(168,230,216,0.5)", fontFamily: "var(--font-lora), Georgia, serif" }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-5" style={{ borderTop: "1px solid rgba(168,230,216,0.10)" }}>
          <p className="text-[0.72rem] leading-relaxed" style={{ color: "rgba(168,230,216,0.35)" }}>Your data is protected and never shared.<br />We will never spam you.</p>
        </div>
      </div>

      {/* ── Right — form ── */}
      <div
        className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 overflow-y-auto transition-all duration-500"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(18px)" }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/"><ElojeLogo width={60} height={52} /></Link>
        </div>

        <div className="w-full max-w-[430px] mx-auto lg:mx-0">
          <div className="eyebrow mb-2.5"><div className="ey-dash" /><span className="ey-txt">Create Account</span></div>
          <h1 className="font-[var(--font-cormorant)] font-bold leading-tight mb-2" style={{ fontSize: "clamp(1.9rem,2.8vw,2.5rem)", color: "var(--deep)" }}>Start your legacy</h1>
          <p className="font-[var(--font-lora)] text-[0.87rem] leading-relaxed mb-8" style={{ color: "var(--grey)" }}>Join thousands of Nigerians investing in meaningful change.</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {(["firstName", "lastName"] as Field[]).map((f) => (
                <div key={f}>
                  <label className="block mb-1.5 text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>
                    {f === "firstName" ? "First name" : "Last name"}
                  </label>
                  <input
                    type="text" value={form[f]} onChange={set(f)}
                    placeholder={f === "firstName" ? "Amara" : "Okonkwo"}
                    required autoComplete={f === "firstName" ? "given-name" : "family-name"}
                    className="block w-full px-3.5 py-3 rounded-md text-[0.9rem] outline-none transition-all duration-200"
                    style={{ border: "1px solid var(--border)", background: "var(--warm)", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif" }}
                    onFocus={(e) => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                    onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1.5 text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>Email address</label>
              <input
                type="email" value={form.email} onChange={set("email")}
                placeholder="you@example.com" required autoComplete="email"
                className="block w-full px-3.5 py-3 rounded-md text-[0.9rem] outline-none transition-all duration-200"
                style={{ border: "1px solid var(--border)", background: "var(--warm)", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1.5 text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} value={form.password} onChange={set("password")}
                  placeholder="Min 6 chars with letters & numbers" required autoComplete="new-password"
                  className="block w-full px-3.5 py-3 pr-11 rounded-md text-[0.9rem] outline-none transition-all duration-200"
                  style={{ border: "1px solid var(--border)", background: "var(--warm)", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                  onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
                <ToggleEye show={showPw} onToggle={() => setShowPw((v) => !v)} />
              </div>
              {form.password && <PwStrengthBar strength={pwStrength} />}
            </div>

            {/* Confirm */}
            <div>
              <label className="block mb-1.5 text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>Confirm password</label>
              <input
                type={showPw ? "text" : "password"} value={form.confirm} onChange={set("confirm")}
                placeholder="Repeat password" required autoComplete="new-password"
                className="block w-full px-3.5 py-3 rounded-md text-[0.9rem] outline-none transition-all duration-200"
                style={{ border: `1px solid ${form.confirm && form.confirm !== form.password ? "rgba(185,28,28,0.45)" : "var(--border)"}`, background: "var(--warm)", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                onBlur={(e)  => { e.target.style.borderColor = form.confirm && form.confirm !== form.password ? "rgba(185,28,28,0.45)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
              {form.confirm && form.confirm !== form.password && (
                <p className="mt-1 text-[0.72rem]" style={{ color: "#991b1b" }}>Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="mt-1 flex items-center justify-center gap-2.5 py-3.5 px-7 rounded-[5px] text-[0.7rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-200 disabled:cursor-not-allowed"
              style={{ background: loading ? "var(--mgrey)" : "var(--deep)", color: "var(--cream)", fontFamily: "var(--font-jost), sans-serif" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "var(--emerald)"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "var(--deep)"); }}
            >
              {loading && <Spinner />}
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[0.82rem]" style={{ color: "var(--grey)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold" style={{ color: "var(--emerald)" }}>Sign in →</Link>
          </p>
          <p className="mt-4 text-center text-[0.68rem] leading-relaxed" style={{ color: "var(--mgrey)" }}>
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline" style={{ color: "var(--mid)" }}>Terms</Link>{" & "}
            <Link href="/privacy" className="underline" style={{ color: "var(--mid)" }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Screens ── */
function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] p-5">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(13,110,79,0.08)", border: "1px solid rgba(13,110,79,0.2)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 className="font-[var(--font-cormorant)] text-4xl font-bold mb-3" style={{ color: "var(--deep)" }}>Account created!</h2>
        <p className="font-[var(--font-lora)] text-[0.9rem] leading-relaxed mb-4" style={{ color: "var(--grey)" }}>We&apos;ve sent a verification link to your email. Please click it to activate your account.</p>
        <p className="text-[0.72rem] tracking-[0.1em]" style={{ color: "var(--mgrey)" }}>Redirecting you to login…</p>
      </div>
    </div>
  );
}

/* ── Shared helpers ── */
function ToggleEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 cursor-pointer transition-opacity hover:opacity-70" style={{ color: "var(--mgrey)" }} aria-label={show ? "Hide password" : "Show password"}>
      {show
        ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
        : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      }
    </button>
  );
}


function getPwStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (pw.length >= 10 && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 3) as 0 | 1 | 2 | 3;
}

function PwStrengthBar({ strength }: { strength: 0 | 1 | 2 | 3 }) {
  const labels = ["", "Weak", "Fair", "Strong"];
  const colors = ["", "#b91c1c", "var(--gold)", "var(--mid)"];
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-[3px] rounded-sm transition-colors duration-300" style={{ background: i <= strength ? colors[strength] : "var(--border)" }} />
        ))}
      </div>
      {strength > 0 && <p className="mt-1 text-[0.66rem] tracking-[0.08em]" style={{ color: colors[strength] }}>{labels[strength]}</p>}
    </div>
  );
}