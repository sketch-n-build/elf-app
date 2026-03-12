"use client";

import { useState } from "react";

const amounts = [
  { value: "₦2,500",  label: "1 nutrition pack" },
  { value: "₦5,000",  label: "Feed a child/month" },
  { value: "₦10,000", label: "Health visit + meds" },
  { value: "₦20,000", label: "Annual health cover" },
  { value: "₦50,000", label: "Term scholarship" },
  { value: "Other",   label: "Choose your own" },
];

export default function DonateForm() {
  const [selected, setSelected] = useState(1);
  const [done, setDone]         = useState(false);

  const btnLabel = done
    ? "✓ Thank you! Your donation makes a difference."
    : `Complete Donation${selected !== 5 ? ` — ${amounts[selected].value}` : ""}`;

  return (
    <div
      className="rounded-[18px] p-6 sm:p-[42px]"
      style={{
        background: "var(--white, #fff)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 38px var(--shadow)",
      }}
    >
      <h2
        className="mb-[26px]"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.7rem",
          fontWeight: 700,
          color: "var(--deep)",
        }}
      >
        Make a Donation
      </h2>

      <div className="eyebrow mb-3">
        <div className="ey-dash" />
        <span className="ey-txt">Choose an amount</span>
      </div>

      {/* Amount grid */}
      <div className="grid grid-cols-3 gap-[9px] mb-5">
        {amounts.map((a, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`abtn${selected === i ? " active" : ""}`}
          >
            <span className="av">{a.value}</span>
            <span className="ai">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="mb-[14px]">
        <label
          className="block mb-[6px]"
          style={{ fontSize: "0.65rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)" }}
        >
          Full Name
        </label>
        <input
          type="text"
          placeholder="Amara Okonkwo"
          className="w-full px-[15px] py-3 rounded-[7px] text-[0.88rem] outline-none transition-colors duration-200"
          style={{
            border: "1px solid var(--border)",
            background: "var(--warm)",
            color: "var(--ink)",
            fontFamily: "var(--font-jost), sans-serif",
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--mid)")}
          onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
        />
      </div>

      <div className="mb-[14px]">
        <label
          className="block mb-[6px]"
          style={{ fontSize: "0.65rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)" }}
        >
          Email Address
        </label>
        <input
          type="email"
          placeholder="amara@example.com"
          className="w-full px-[15px] py-3 rounded-[7px] text-[0.88rem] outline-none transition-colors duration-200"
          style={{
            border: "1px solid var(--border)",
            background: "var(--warm)",
            color: "var(--ink)",
            fontFamily: "var(--font-jost), sans-serif",
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--mid)")}
          onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[11px] mb-[14px]">
        <div>
          <label
            className="block mb-[6px]"
            style={{ fontSize: "0.65rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)" }}
          >
            Phone
          </label>
          <input
            type="tel"
            placeholder="+234 800 000 0000"
            className="w-full px-[15px] py-3 rounded-[7px] text-[0.88rem] outline-none transition-colors duration-200"
            style={{
              border: "1px solid var(--border)",
              background: "var(--warm)",
              color: "var(--ink)",
              fontFamily: "var(--font-jost), sans-serif",
            }}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--mid)")}
            onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
          />
        </div>
        <div>
          <label
            className="block mb-[6px]"
            style={{ fontSize: "0.65rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)" }}
          >
            State
          </label>
          <input
            type="text"
            placeholder="Anambra"
            className="w-full px-[15px] py-3 rounded-[7px] text-[0.88rem] outline-none transition-colors duration-200"
            style={{
              border: "1px solid var(--border)",
              background: "var(--warm)",
              color: "var(--ink)",
              fontFamily: "var(--font-jost), sans-serif",
            }}
            onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--mid)")}
            onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      <div className="mb-5">
        <label
          className="block mb-[6px]"
          style={{ fontSize: "0.65rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)" }}
        >
          Dedication (optional)
        </label>
        <input
          type="text"
          placeholder="In honour of / In memory of…"
          className="w-full px-[15px] py-3 rounded-[7px] text-[0.88rem] outline-none transition-colors duration-200"
          style={{
            border: "1px solid var(--border)",
            background: "var(--warm)",
            color: "var(--ink)",
            fontFamily: "var(--font-jost), sans-serif",
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "var(--mid)")}
          onBlur={(e)  => ((e.target as HTMLInputElement).style.borderColor = "var(--border)")}
        />
      </div>

      {/* Submit */}
      <button
        onClick={() => setDone(true)}
        className="w-full py-4 rounded-[8px] text-[0.73rem] font-semibold tracking-[0.22em] uppercase transition-colors duration-200 mt-[6px]"
        style={{
          background: done ? "var(--emerald)" : "var(--deep)",
          color: "var(--cream)",
          border: "none",
        }}
      >
        {btnLabel}
      </button>

      <p
        className="text-center mt-3 leading-[1.6]"
        style={{ fontSize: "0.68rem", color: "var(--mgrey)" }}
      >
        🔒 Secure payment · Receipts issued · CAC Registered NGO
      </p>
    </div>
  );
}