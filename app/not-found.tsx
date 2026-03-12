"use client"
import Link from "next/link";
import ElojeLogo from "./components/ui/ElojeLogo";

export default function NotFound() {
  return (
    <div
      className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center relative overflow-hidden px-5"
      style={{ background: "var(--ink)" }}
    >
      {/* Background radial glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-120px",
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          height: 640,
          background:
            "radial-gradient(circle, rgba(13,110,79,0.14) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-80px",
          right: "-80px",
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 65%)",
          borderRadius: "50%",
        }}
      />

      {/* Decorative circles */}
      <div
        className="absolute rounded-full opacity-[0.04]"
        style={{
          bottom: 40,
          left: 40,
          width: 300,
          height: 300,
          border: "1px solid var(--pale)",
        }}
      />
      <div
        className="absolute rounded-full opacity-[0.04]"
        style={{
          bottom: 80,
          left: 80,
          width: 200,
          height: 200,
          border: "1px solid var(--glow)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-[560px]">
        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-[9px] mb-6">
          <span className="w-5 h-px" style={{ background: "var(--glow)" }} />
          <span
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "var(--glow)",
            }}
          >
            Page Not Found
          </span>
          <span className="w-5 h-px" style={{ background: "var(--glow)" }} />
        </div>

        {/* 404 */}
        <div
          className="mb-4 leading-none select-none"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(7rem, 18vw, 14rem)",
            fontWeight: 700,
            color: "transparent",
            WebkitTextStroke: "1px rgba(52,211,153,0.18)",
            letterSpacing: "-0.02em",
          }}
        >
          404
        </div>

        {/* Brand mark accent */}
        <div className="flex justify-center mb-8">
            <ElojeLogo />
          {/* <svg width="48" height="54" viewBox="0 0 60 68" fill="none" style={{ opacity: 0.6 }}>
            <circle cx="38" cy="10" r="9" fill="#10B981" />
            <path
              d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z"
              fill="#0D6E4F"
            />
            <circle cx="16" cy="24" r="7.5" fill="#34D399" />
            <path
              d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z"
              fill="#34D399"
            />
          </svg> */}
        </div>

        <h1
          className="mb-4"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
            fontWeight: 600,
            color: "var(--cream)",
            lineHeight: 1.15,
          }}
        >
          This page has grown{" "}
          <em style={{ fontStyle: "italic", color: "var(--glow)" }}>beyond our reach</em>
        </h1>

        <p
          className="mb-10 mx-auto"
          style={{
            fontFamily: "var(--font-lora), Georgia, serif",
            fontSize: "0.95rem",
            lineHeight: 1.85,
            color: "rgba(250,246,239,0.48)",
            maxWidth: 400,
          }}
        >
          The page you're looking for may have moved, been renamed, or no longer exists. Let's guide you back to something meaningful.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-[9px] px-[30px] py-[14px] rounded-[4px] text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px] hover:brightness-110"
            style={{ background: "var(--gold)", color: "var(--ink)" }}
          >
            ← Back to Home
          </Link>
          <Link
            href="/programmes"
            className="inline-flex items-center gap-[9px] px-[30px] py-[14px] rounded-[4px] text-[0.7rem] font-medium tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px]"
            style={{
              border: "1px solid rgba(168,230,216,0.28)",
              color: "var(--pale)",
              background: "transparent",
            }}
          >
            Our Programmes
          </Link>
        </div>

        {/* Quick links */}
        <div
          className="mt-14 pt-8 flex flex-wrap items-center justify-center gap-6"
          style={{ borderTop: "1px solid rgba(168,230,216,0.08)" }}
        >
          {[
            { label: "About Us",  href: "/about"      },
            { label: "Blog",      href: "/blog"        },
            { label: "Donate",    href: "/donate"      },
            { label: "Contact",   href: "/contact"     },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(250,246,239,0.32)",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "var(--pale)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color =
                  "rgba(250,246,239,0.32)")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}