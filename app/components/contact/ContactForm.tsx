"use client";

import { useState } from "react";

type Subject =
  | "General Enquiry"
  | "Donation Support"
  | "Partnership"
  | "Volunteer"
  | "Media"
  | "Other";

const SUBJECTS: Subject[] = [
  "General Enquiry",
  "Donation Support",
  "Partnership",
  "Volunteer",
  "Media",
  "Other",
];

export default function ContactForm() {
  const [subject, setSubject] = useState<Subject>("General Enquiry");
  const [sent,    setSent]    = useState(false);

  const inputBase =
    "w-full px-[15px] py-3 rounded-[8px] text-[0.88rem] outline-none transition-all duration-200";
  const inputStyle = {
    border:     "1px solid var(--border)",
    background: "var(--warm)",
    color:      "var(--ink)",
    fontFamily: "var(--font-jost), sans-serif",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--mid)";
    e.target.style.boxShadow   = "0 0 0 3px rgba(16,184,129,0.09)";
    e.target.style.background  = "#fff";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow   = "none";
    e.target.style.background  = "var(--warm)";
  };

  if (sent) {
    return (
      <div
        className="rounded-[18px] p-10 sm:p-14 flex flex-col items-center text-center"
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 38px var(--shadow)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "rgba(13,110,79,0.08)",
            border: "1px solid rgba(13,110,79,0.2)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17L4 12"
              stroke="var(--emerald)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3
          className="mb-3"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "var(--deep)",
          }}
        >
          Message Received
        </h3>
        <p
          className="mb-8 max-w-[360px]"
          style={{
            fontFamily: "var(--font-lora), Georgia, serif",
            fontSize: "0.92rem",
            lineHeight: 1.8,
            color: "var(--grey)",
          }}
        >
          Thank you for reaching out. A member of our team will get back to you within 2 business days.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-[0.68rem] tracking-[0.2em] uppercase"
          style={{ color: "var(--emerald)", background: "none", border: "none" }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div
      className="rounded-[18px] p-6 sm:p-[42px]"
      style={{
        background: "#fff",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 38px var(--shadow)",
      }}
    >
      <h2
        className="mb-2"
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.7rem",
          fontWeight: 700,
          color: "var(--deep)",
        }}
      >
        Send us a message
      </h2>
      <p
        className="mb-7"
        style={{ fontSize: "0.82rem", color: "var(--mgrey)", lineHeight: 1.6 }}
      >
        We typically respond within 2 business days.
      </p>

      {/* Subject selector */}
      <div className="mb-5">
        <label
          className="block mb-[6px]"
          style={{
            fontSize: "0.64rem",
            letterSpacing: "0.17em",
            textTransform: "uppercase",
            color: "var(--emerald)",
            fontWeight: 500,
          }}
        >
          Subject
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className="px-3 py-2 rounded-[7px] text-[0.66rem] tracking-[0.08em] transition-all duration-200 text-center"
              style={{
                border:     `1px solid ${subject === s ? "var(--mid)" : "var(--border)"}`,
                background: subject === s ? "var(--warm2)" : "var(--warm)",
                color:      subject === s ? "var(--deep)"  : "var(--grey)",
                fontFamily: "var(--font-jost), sans-serif",
                fontWeight: subject === s ? 500 : 400,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            className="block mb-[6px]"
            style={{ fontSize: "0.64rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)", fontWeight: 500 }}
          >
            Full Name
          </label>
          <input
            type="text"
            placeholder="Amara Okonkwo"
            className={inputBase}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label
            className="block mb-[6px]"
            style={{ fontSize: "0.64rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)", fontWeight: 500 }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="amara@example.com"
            className={inputBase}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Phone + Organisation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            className="block mb-[6px]"
            style={{ fontSize: "0.64rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)", fontWeight: 500 }}
          >
            Phone <span style={{ color: "var(--mgrey)", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="tel"
            placeholder="+234 800 000 0000"
            className={inputBase}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label
            className="block mb-[6px]"
            style={{ fontSize: "0.64rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)", fontWeight: 500 }}
          >
            Organisation <span style={{ color: "var(--mgrey)", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Your company or NGO"
            className={inputBase}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label
          className="block mb-[6px]"
          style={{ fontSize: "0.64rem", letterSpacing: "0.17em", textTransform: "uppercase", color: "var(--emerald)", fontWeight: 500 }}
        >
          Message
        </label>
        <textarea
          rows={5}
          placeholder="Tell us how we can help…"
          className={inputBase}
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: 120,
            display: "block",
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <button
        onClick={() => setSent(true)}
        className="w-full py-4 rounded-[8px] text-[0.73rem] font-semibold tracking-[0.22em] uppercase transition-all duration-200 hover:-translate-y-[1px]"
        style={{
          background: "var(--deep)",
          color:      "var(--cream)",
          border:     "none",
          fontFamily: "var(--font-jost), sans-serif",
        }}
      >
        Send Message →
      </button>

      <p
        className="text-center mt-4"
        style={{ fontSize: "0.68rem", color: "var(--mgrey)", lineHeight: 1.6 }}
      >
        🔒 Your information is private and will never be shared.
      </p>
    </div>
  );
}