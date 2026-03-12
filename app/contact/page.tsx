// import Footer from "@/components/Footer";
import PageBanner from "../components/PageBanner";
import ContactForm from "../components/contact/ContactForm";
import Link from "next/link";

const contactInfo = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Our Office",
    value: "12 Oguta Road, Onitsha\nAnambra State, Nigeria",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Email Us",
    value: "hello@eleleje.ng",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Call Us",
    value: "+234 800 ELE JENG\n+234 812 345 6789",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="var(--glow)" strokeWidth="1.5"/>
        <path d="M12 6v6l4 2" stroke="var(--glow)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Office Hours",
    value: "Monday – Friday\n8:00 AM – 5:00 PM WAT",
  },
];

const faqs = [
  {
    q: "How do I make a donation?",
    a: "You can donate directly through our Donate page using bank transfer or card. Receipts are issued for every donation.",
  },
  {
    q: "Can I volunteer with Eleje Legacy?",
    a: "Yes! We welcome volunteers in health outreach, education, community mobilisation, and communications. Use the contact form above with subject 'Volunteer'.",
  },
  {
    q: "Do you accept in-kind donations?",
    a: "We accept certain in-kind donations including medical supplies, educational materials, and food items. Please contact us first to confirm what is currently needed.",
  },
  {
    q: "How can my organisation partner with you?",
    a: "We welcome partnerships with NGOs, corporate organisations, and government agencies. Select 'Partnership' in the form above and tell us about your organisation.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageBanner
        label="Get in Touch"
        title={
          <>
            We&apos;d love to{" "}
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>hear from you.</em>
          </>
        }
        minHeight="38vh"
      />

      {/* ── Main grid ────────────────────────────────────── */}
      <div className="section-wrap py-18 pb-24" style={{padding: "50px 0"}}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-14 items-start">
          {/* Form column */}
          <ContactForm />

          {/* Info column */}
          <div className="flex flex-col gap-8">
            {/* Contact details */}
            <div>
              <div className="eyebrow mb-5">
                <div className="ey-dash" />
                <span className="ey-txt">Find Us</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {contactInfo.map((c) => (
                  <div
                    key={c.label}
                    className="flex gap-4 p-5 rounded-xl"
                    style={{
                      background: "var(--warm)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(52,211,153,0.08)",
                        border: "1px solid rgba(52,211,153,0.15)",
                      }}
                    >
                      {c.icon}
                    </div>
                    <div>
                      <div
                        className="mb-1"
                        style={{
                          fontSize: "0.62rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          color: "var(--mid)",
                          fontWeight: 500,
                        }}
                      >
                        {c.label}
                      </div>
                      {c.value.split("\n").map((line, i) => (
                        <div
                          key={i}
                          style={{ fontSize: "0.84rem", lineHeight: 1.65, color: "var(--grey)" }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div
              className="rounded-[16px] overflow-hidden relative"
              style={{
                height: 220,
                background: "linear-gradient(140deg, var(--deep) 0%, var(--emerald) 100%)",
                border: "1px solid var(--border)",
              }}
            >
              {/* Decorative grid pattern */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--pale) 1px, transparent 1px), linear-gradient(90deg, var(--pale) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              {/* Pin icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(250,246,239,0.12)",
                    border: "1px solid rgba(250,246,239,0.2)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="var(--pale)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke="var(--pale)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--cream)",
                    }}
                  >
                    Onitsha, Anambra State
                  </p>
                  <p style={{ fontSize: "0.68rem", color: "rgba(250,246,239,0.5)", marginTop: 3 }}>
                    12 Oguta Road, Nigeria
                  </p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div>
              <p
                className="mb-3"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--mgrey)",
                }}
              >
                Follow Our Work
              </p>
              <div className="flex gap-3">
                {[
                  { label: "Facebook",  short: "FB" },
                  { label: "Twitter/X", short: "X"  },
                  { label: "Instagram", short: "IG" },
                  { label: "LinkedIn",  short: "in" },
                ].map((s) => (
                  <button
                    key={s.label}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-[0.66rem] tracking-[0.12em] transition-all duration-200 hover:-translate-y-[1px]"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--warm)",
                      color: "var(--grey)",
                      fontFamily: "var(--font-jost), sans-serif",
                    }}
                    aria-label={s.label}
                  >
                    <span
                      className="font-bold"
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "0.9rem",
                        color: "var(--emerald)",
                      }}
                    >
                      {s.short}
                    </span>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section style={{ background: "var(--warm)", borderTop: "1px solid var(--border)", padding: "50px 0" }}>
        <div className="section-wrap py-[80px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-[68px]">
            {/* Left label */}
            <div>
              <div className="eyebrow mb-4">
                <div className="ey-dash" />
                <span className="ey-txt">FAQ</span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                  fontWeight: 600,
                  lineHeight: 1.12,
                  color: "var(--deep)",
                }}
              >
                Common <em style={{ fontStyle: "italic", color: "var(--emerald)" }}>questions</em>
              </h2>
              <p
                className="mt-4"
                style={{
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "0.88rem",
                  lineHeight: 1.8,
                  color: "var(--grey)",
                }}
              >
                Can&apos;t find what you&apos;re looking for? Use the contact form above.
              </p>
            </div>

            {/* Right FAQs */}
            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[12px] p-6"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${
                      i % 3 === 0
                        ? "var(--mid)"
                        : i % 3 === 1
                        ? "var(--gold)"
                        : "var(--deep)"
                    }`,
                  }}
                >
                  <h4
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color: "var(--deep)",
                    }}
                  >
                    {faq.q}
                  </h4>
                  <p
                    style={{
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: "0.86rem",
                      lineHeight: 1.78,
                      color: "var(--grey)",
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────── */}
      <div
        className="py-[72px] text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(140deg, var(--deep) 0%, var(--emerald) 100%)",
        }}
      >
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: -80,
            right: -80,
            width: 380,
            height: 380,
            background: "radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 65%)",
          }}
        />
        <div className="section-wrap relative z-10">
          <p
            className="mb-3"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "var(--glow)",
            }}
          >
            Ready to Make a Difference?
          </p>
          <h2
            className="mb-5"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 600,
              color: "var(--cream)",
              lineHeight: 1.12,
            }}
          >
            Every naira plants a{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold-lt)" }}>seed of legacy</em>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/donate"
              className="inline-flex items-center gap-[9px] px-[30px] py-[14px] rounded-[4px] text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px] hover:brightness-110"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              Donate Now →
            </Link>
            <Link
              href="/programmes"
              className="inline-flex items-center gap-[9px] px-[30px] py-[14px] rounded-[4px] text-[0.7rem] font-medium tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                border: "1px solid rgba(168,230,216,0.28)",
                color: "var(--pale)",
              }}
            >
              Our Programmes
            </Link>
          </div>
        </div>
      </div>

      {/* <Footer minimal /> */}
    </>
  );
}