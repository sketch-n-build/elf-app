"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ElojeLogo from "./ui/ElojeLogo";

const navLinks = [
  { href: "/",           label: "Home" },
  { href: "/about",      label: "About" },
  { href: "/programmes", label: "Programmes" },
  { href: "/donation",     label: "Donattions" },
];

export default function Nav() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[200] h-[68px] flex items-center justify-between px-5 md:px-[52px]"
        style={{
          background: "rgba(12,24,16,0.94)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(52,211,153,0.09)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <ElojeLogo />
          <div style={{ lineHeight: 1 }}>
            <b
              className="block"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "var(--pale)",
                letterSpacing: "0.08em",
              }}
            >
              Eleje
            </b>
            <small
              className="block mt-[2px]"
              style={{
                fontSize: "0.5rem",
                letterSpacing: "0.5em",
                color: "var(--glow)",
              }}
            >
              Legacy
            </small>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-[30px] list-none">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`nav-link${pathname === l.href ? " active" : ""}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-[10px]">
          <Link
            href="/auth/login"
            className="px-5 py-2 rounded-[4px] text-[0.68rem] font-medium tracking-[0.15em] uppercase transition-all duration-200"
            style={{
              border: "1px solid rgba(168,230,216,0.22)",
              color: "var(--pale)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--glow)";
              (e.currentTarget as HTMLElement).style.color       = "var(--glow)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(168,230,216,0.22)";
              (e.currentTarget as HTMLElement).style.color       = "var(--pale)";
            }}
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="px-[22px] py-2 rounded-[4px] text-[0.68rem] font-semibold tracking-[0.15em] uppercase transition-all duration-200 hover:-translate-y-px hover:brightness-110"
            style={{ background: "var(--gold)", color: "var(--ink)", border: "none" }}
          >
            Join Us
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col justify-center gap-[5px] p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className="block w-6 h-[2px] transition-all duration-300"
            style={{
              background: "var(--pale)",
              transform: open ? "translateY(7px) rotate(45deg)" : "",
            }}
          />
          <span
            className="block w-6 h-[2px] transition-all duration-300"
            style={{
              background: "var(--pale)",
              opacity: open ? 0 : 1,
            }}
          />
          <span
            className="block w-6 h-[2px] transition-all duration-300"
            style={{
              background: "var(--pale)",
              transform: open ? "translateY(-7px) rotate(-45deg)" : "",
            }}
          />
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div
          className="fixed top-[68px] left-0 right-0 z-[199] md:hidden"
          style={{
            background: "rgba(12,24,16,0.97)",
            backdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(52,211,153,0.12)",
          }}
        >
          <ul className="list-none flex flex-col py-4 px-5">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm tracking-[0.2em] uppercase"
                  style={{
                    color: pathname === l.href ? "var(--glow)" : "rgba(250,246,239,0.6)",
                    borderBottom: "1px solid rgba(52,211,153,0.06)",
                  }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 px-5 pb-5 pt-2">
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="flex-1 text-center py-2 rounded text-xs tracking-[0.15em] uppercase"
              style={{
                border: "1px solid rgba(168,230,216,0.22)",
                color: "var(--pale)",
              }}
            >
              Log In
            </Link>
            <Link
              href="/auth?tab=signup"
              onClick={() => setOpen(false)}
              className="flex-1 text-center py-2 rounded text-xs font-semibold tracking-[0.15em] uppercase"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              Join Us
            </Link>
          </div>
        </div>
      )}
    </>
  );
}