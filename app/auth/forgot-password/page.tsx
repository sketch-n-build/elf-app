"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import axios from "axios";
import ElojeLogo from "@/app/components/ui/ElojeLogo";
import useAxiosPrivate from "@/app/hooks/useAxiosPrivate";
import { Spinner } from "@/app/components/loading/Spinner";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => { setMounted(true); inputRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    setLoading(true);
    try {
      // API always returns 200 (anti-enumeration) — we always show sent state
      await axiosPrivate.post("/api/auth/forgot-password", { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err: any) {
      if (axios.isAxiosError(err) && !err.response) {
        toast.error("Network error. Please check your connection.");
      } else {
        // Still show sent state to prevent enumeration
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-5 py-10 relative overflow-hidden">
      {/* Bg blobs */}
      <div className="absolute pointer-events-none" style={{ top: -160, right: -160, width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(13,110,79,0.06) 0%, transparent 65%)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 65%)" }} />
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--ink) 1px,transparent 1px),linear-gradient(90deg,var(--ink) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[460px] bg-white rounded-2xl p-8 sm:p-12 transition-all duration-500"
        style={{ border: "1px solid var(--border)", boxShadow: "0 20px 60px var(--shadow)", opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)" }}
      >
        <div className="text-center mb-9">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <ElojeLogo width={100} height={85} />
          </Link>

          {!sent ? (
            <>
              <div className="w-[58px] h-[58px] rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(13,110,79,0.07)", border: "1px solid rgba(13,110,79,0.15)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <h1 className="font-[var(--font-cormorant)] text-[1.9rem] font-bold leading-tight mb-2" style={{ color: "var(--deep)" }}>Reset your password</h1>
              <p className="font-[var(--font-lora)] text-[0.86rem] leading-relaxed" style={{ color: "var(--grey)" }}>Enter the email address linked to your account and we&apos;ll send you a secure link.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(13,110,79,0.08)", border: "1px solid rgba(13,110,79,0.18)" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--emerald)" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h2 className="font-[var(--font-cormorant)] text-[1.8rem] font-bold leading-tight mb-2.5" style={{ color: "var(--deep)" }}>Check your inbox</h2>
              <p className="font-[var(--font-lora)] text-[0.86rem] leading-relaxed mb-1.5" style={{ color: "var(--grey)" }}>
                If <strong style={{ color: "var(--deep)" }}>{email}</strong> is registered, you&apos;ll receive a reset link within a few minutes.
              </p>
              <p className="text-[0.74rem] leading-relaxed" style={{ color: "var(--mgrey)" }}>Didn&apos;t receive it? Check your spam folder, or wait 5 minutes before requesting again.</p>
            </>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-[0.7rem] tracking-[0.14em] uppercase font-medium" style={{ color: "var(--grey)" }}>Email address</label>
              <input
                ref={inputRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoComplete="email"
                className="block w-full px-3.5 py-3 rounded-md text-[0.9rem] outline-none transition-all duration-200"
                style={{ border: "1px solid var(--border)", background: "var(--warm)", color: "var(--ink)", fontFamily: "var(--font-jost), sans-serif" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--mid)"; e.target.style.boxShadow = "0 0 0 3px rgba(13,110,79,0.08)"; }}
                onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="flex items-center justify-center gap-2.5 py-3.5 px-7 rounded-[5px] text-[0.7rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-200 disabled:cursor-not-allowed"
              style={{ background: loading ? "var(--mgrey)" : "var(--deep)", color: "var(--cream)", fontFamily: "var(--font-jost), sans-serif" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "var(--emerald)"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "var(--deep)"); }}
            >
              {loading && <Spinner />}
              {loading ? "Sending link…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-7 pt-5 flex justify-center gap-6" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/auth/login" className="flex items-center gap-1.5 text-[0.78rem] transition-opacity hover:opacity-70" style={{ color: "var(--mid)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to login
          </Link>
          <Link href="/auth/signup" className="text-[0.78rem] transition-opacity hover:opacity-70" style={{ color: "var(--mid)" }}>Create account</Link>
        </div>
      </div>
    </div>
  );
}
