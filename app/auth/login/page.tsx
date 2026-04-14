"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ElojeLogo from "@/app/components/ui/ElojeLogo";
// import { useUserStore } from "@/store/useUserStore";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";;
import { useUserStore } from "@/app/store/useUserStore";
import { Spinner } from "@/app/components/loading/Spinner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

/* ── Sub-components ── */

function EyeOn() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function EyeOff() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>;
}

function LoginInner() {
  const router      = useRouter();
  const params      = useSearchParams();
  const { setUser } = useUserStore();
  const axiosPrivate = useAxiosPrivate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosPrivate.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // Decode the JWT payload to get user details (no extra /me call needed)
      // const payloadBase64 = data.data.accessToken.split(".")[1];
      // const payload = JSON.parse(atob(payloadBase64));

      console.log("login data", data.data)

      setUser({
        id:          data.data.sub,
        email:       data.data.email,
        firstName:   data.data.firstName ?? "",
        lastName:    data.data.lastName  ?? "",
        role:        data.data.role,
        accessToken: data.data.accessToken,
      });

      toast.success(`Welcome back, ${data.data.firstName || ""}!`);

      const from = params.get("from") ?? "/dashboard";
      router.push(from);
    } catch (err: any) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message ?? err?.response?.data?.error;

      if (status === 403) {
        // Unverified email
        toast.warning(message ?? "Please verify your email before logging in.");
      } else if (status === 401) {
        toast.error(message ?? "Invalid credentials. Please try again.");
      } else if (axios.isAxiosError(err) && !err.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(message ?? "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--cream)]">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, var(--ink) 0%, var(--deep) 45%, var(--emerald) 100%)" }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(var(--pale) 1px,transparent 1px),linear-gradient(90deg,var(--pale) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glows */}
        <div className="absolute pointer-events-none" style={{ bottom: -120, left: -80, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,211,153,0.13) 0%, transparent 65%)" }} />
        <div className="absolute pointer-events-none" style={{ top: -60, right: -60, width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)" }} />

        {/* Logo */}
        {/* <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <ElojeLogo width={100} height={85} />
            <span className="font-[var(--font-cormorant)] text-xl font-bold tracking-wide" style={{ color: "var(--cream)" }}>
              Eleje Legacy
            </span>
          </Link>
        </div> */}

        {/* Quote */}
        <div className="relative z-10 flex-1 flex flex-col justify-center pt-16">
          <div className="w-9 h-[3px] rounded-sm mb-7" style={{ background: "var(--gold)" }} />
          <blockquote className="font-[var(--font-cormorant)] font-semibold leading-tight max-w-sm" style={{ fontSize: "clamp(1.7rem, 2.4vw, 2.6rem)", color: "var(--cream)" }}>
            Investing in people is the most{" "}
            <em className="italic" style={{ color: "var(--glow)" }}>enduring legacy</em>{" "}
            of all.
          </blockquote>
          <p className="mt-5 font-[var(--font-lora)] text-sm leading-relaxed max-w-sm" style={{ color: "rgba(168,230,216,0.55)" }}>
            Welcome back. Log in to manage your contributions, track impact, and help build a better Nigeria.
          </p>
        </div>

        {/* Stat strip */}
        <div className="relative z-10 flex gap-8 pt-6" style={{ borderTop: "1px solid rgba(168,230,216,0.10)" }}>
          {[
            { n: "340+", l: "Scholarships" },
            { n: "6",    l: "ECD Centres" },
            { n: "97%",  l: "Retention Rate" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-[var(--font-cormorant)] text-2xl font-bold leading-none" style={{ color: "var(--pale)" }}>{s.n}</div>
              <div className="text-[0.58rem] tracking-[0.24em] uppercase mt-1" style={{ color: "rgba(168,230,216,0.4)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div
        className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 transition-all duration-500"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(18px)" }}
      >
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <ElojeLogo width={60} height={52} />
          </Link>
        </div>

        <div className="w-full max-w-[420px] mx-auto lg:mx-0">
          <div className="eyebrow mb-2.5">
            <div className="ey-dash" />
            <span className="ey-txt">Member Portal</span>
          </div>

          <h1 className="font-[var(--font-cormorant)] font-bold leading-tight mb-2" style={{ fontSize: "clamp(2rem,3vw,2.6rem)", color: "var(--deep)" }}>
            Welcome back
          </h1>
          <p className="font-[var(--font-lora)] text-sm leading-relaxed mb-9" style={{ color: "var(--grey)" }}>
            Sign in to your account to continue.
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block mb-1.5 text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>
                Email address
              </label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="block w-full px-3.5 py-3 rounded-md text-[0.9rem] outline-none transition-all duration-200 focus:ring-[3px]"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--warm)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-jost), sans-serif",
                  // @ts-ignore
                  "--tw-ring-color": "rgba(13,110,79,0.08)",
                  focusBorderColor: "var(--mid)",
                }}
                onFocus={(e)  => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                onBlur={(e)   => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-[0.7rem] tracking-wide transition-colors hover:opacity-80" style={{ color: "var(--mid)" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="block w-full px-3.5 py-3 pr-11 rounded-md text-[0.9rem] outline-none transition-all duration-200"
                  style={{ border: "1px solid var(--border)", background: "var(--warm)", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif" }}
                  onFocus={(e)  => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                  onBlur={(e)   => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70"
                  style={{ color: "var(--mgrey)" }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex items-center justify-center gap-2.5 py-3.5 px-7 rounded-[5px] text-[0.7rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-200 disabled:cursor-not-allowed"
              style={{
                background: loading ? "var(--mgrey)" : "var(--deep)",
                color: "var(--cream)",
                fontFamily: "var(--font-jost), sans-serif",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "var(--emerald)"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "var(--deep)"); }}
            >
              {loading && <Spinner />}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="text-[0.66rem] tracking-[0.1em]" style={{ color: "var(--mgrey)" }}>OR</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <p className="text-center text-[0.82rem]" style={{ color: "var(--grey)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-semibold transition-opacity hover:opacity-80" style={{ color: "var(--emerald)" }}>
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

