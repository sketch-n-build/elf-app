"use client";

import { useState } from "react";
import Link from "next/link";

const tiers = [
  {
    amount: "₦5,000",
    desc: "Feeds a child for one month",
    tag: "Popular",
    tagStyle: {},
  },
  {
    amount: "₦20,000",
    desc: "Sponsors a mother's health check for a year",
    tag: null,
    tagStyle: {},
  },
  {
    amount: "₦50,000",
    desc: "Funds a child's full school term scholarship",
    tag: "Legacy",
    tagStyle: { background: "var(--deep)", color: "var(--glow)" },
  },
];

export default function CtaBand() {
  const [active, setActive] = useState(0);

  return (
    <div
      className="py-[92px] relative overflow-hidden"
      style={{
        background: "linear-gradient(140deg, var(--deep) 0%, var(--emerald) 100%)",
      }}
    >
      {/* Decorative glow */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "-100px",
          right: "-100px",
          width: 480,
          height: 480,
          background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 65%)",
        }}
      />

      <div className="section-wrap relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[76px] items-center">
          {/* Left */}
          <div>
            <div className="eyebrow mb-3">
              <div className="ey-dash" style={{ background: "var(--gold-lt)" }} />
              <span className="ey-txt" style={{ color: "var(--gold-lt)" }}>
                Make a Difference
              </span>
            </div>
            <h2
              className="mb-4"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
                fontWeight: 600,
                color: "var(--cream)",
                lineHeight: 1.12,
              }}
            >
              Every contribution plants<br />
              a{" "}
              <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>
                seed of legacy
              </em>
            </h2>
            <p
              className="mb-7"
              style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontSize: "0.91rem",
                lineHeight: 1.85,
                color: "rgba(250,246,239,0.56)",
              }}
            >
              Your gift feeds a child, supports a mother, and strengthens a community for decades to come.
            </p>
            <Link
              href="/donation"
              className="inline-flex items-center gap-[9px] px-[30px] py-[14px] rounded-[4px] text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px] hover:brightness-110"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              Donate Now →
            </Link>
          </div>

          {/* Right — Tiers */}
          <div className="flex flex-col gap-[11px]">
            {tiers.map((t, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`tier-btn${active === i ? " active" : ""}`}
              >
                <div className="text-left">
                  <div
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.7rem",
                      fontWeight: 700,
                      color: "var(--cream)",
                    }}
                  >
                    {t.amount}
                  </div>
                  <div
                    className="mt-[2px]"
                    style={{ fontSize: "0.74rem", color: "rgba(250,246,239,0.48)" }}
                  >
                    {t.desc}
                  </div>
                </div>
                {t.tag && (
                  <span
                    className="text-[0.57rem] tracking-[0.18em] uppercase px-[10px] py-1 rounded-[2px] flex-shrink-0"
                    style={
                      t.tagStyle && Object.keys(t.tagStyle).length > 0
                        ? t.tagStyle
                        : { background: "var(--gold)", color: "var(--ink)" }
                    }
                  >
                    {t.tag}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}