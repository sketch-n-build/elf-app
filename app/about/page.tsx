import Link from "next/link";
import PageBanner from "../components/PageBanner";
import Footer from "../components/Footer";
// import Footer from "@/components/Footer";
// import PageBanner from "@/components/ui/PageBanner";

const values = [
  {
    n: "01",
    title: "Dignity First",
    text: "Every person we serve is treated with unconditional honour. Our programmes restore and affirm human dignity.",
    accent: "var(--mid)",
  },
  {
    n: "02",
    title: "Community Ownership",
    text: "Sustainable change comes from within. We build local capacity and hand ownership to the community.",
    accent: "var(--glow)",
  },
  {
    n: "03",
    title: "Generational Thinking",
    text: "We measure success in generations. Every decision asks: what does this mean for the child 20 years from now?",
    accent: "var(--gold)",
  },
  {
    n: "04",
    title: "Radical Transparency",
    text: "We publish full financial reports and programme evaluations. Our donors and beneficiaries deserve complete honesty.",
    accent: "var(--deep)",
  },
];

const team = [
  { initials: "AO", name: "Amara Okonkwo",   role: "Executive Director",  bg: "linear-gradient(135deg,#064E38,#10B981)" },
  { initials: "CE", name: "Chidi Ezenwachi",  role: "Head of Programmes",  bg: "linear-gradient(135deg,#0D6E4F,#34D399)" },
  { initials: "NU", name: "Ngozi Umezurike",  role: "Finance & Operations", bg: "linear-gradient(135deg,#C9A84C,#8B6914)" },
  { initials: "IA", name: "Ifeanyi Agu",       role: "Community Engagement", bg: "linear-gradient(135deg,#148a80,#064E38)" },
];

export default function AboutPage() {
  return (
    <>
      <PageBanner
        label="About Eleje Legacy"
        title={
          <>
            Rooted in community.<br />
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>Built for generations.</em>
          </>
        }
      />

      {/* Main content */}
      <div className="section-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[68px] items-start py-[88px]">

          {/* Prose */}
          <div>
            <div className="eyebrow mb-4">
              <div className="ey-dash" />
              <span className="ey-txt">Who We Are</span>
            </div>

            {[
              <>
                Eleje Legacy is a Nigerian non-governmental organisation founded in Onitsha, Anambra State, in 2024. We work at the intersection of{" "}
                <strong style={{ color: "var(--deep)", fontWeight: 600 }}>maternal health, early childhood development, and community economic empowerment</strong>
                {" "}— three pillars we believe are inseparable.
              </>,
              <>
                Our name — <strong style={{ color: "var(--deep)", fontWeight: 600 }}>Eleje</strong> — means "one who nurtures" in the Igbo tradition. It reflects our conviction that true development begins with the mother-child relationship, and that communities flourish when women are empowered, children are nourished, and legacies are intentionally built.
              </>,
              <>
                We are <strong style={{ color: "var(--deep)", fontWeight: 600 }}>grassroots by design</strong>. Every programme we run is co-created with the communities we serve. We do not impose solutions from the outside — we sit with families, listen to their needs, and build responses that are dignified, sustainable, and locally owned.
              </>,
              <>
                Our vision is a Nigeria where no mother faces the journey of parenthood alone, and where every child — regardless of circumstance —{" "}
                <strong style={{ color: "var(--deep)", fontWeight: 600 }}>inherits a future worth living</strong>.
              </>,
            ].map((para, i) => (
              <p
                key={i}
                className="mb-[17px]"
                style={{
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "0.92rem",
                  lineHeight: 2,
                  color: "var(--grey)",
                }}
              >
                {para}
              </p>
            ))}

            <div className="mt-6">
              <Link
                href="/programmes"
                className="inline-flex items-center gap-[9px] px-[30px] py-[14px] rounded-[4px] text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px]"
                style={{ background: "var(--deep)", color: "var(--cream)" }}
              >
                See Our Programmes →
              </Link>
            </div>
          </div>

          {/* Values */}
          <div>
            <div className="eyebrow mb-4">
              <div className="ey-dash" />
              <span className="ey-txt">Core Values</span>
            </div>
            <div className="flex flex-col gap-[14px]">
              {values.map((v) => (
                <div
                  key={v.n}
                  className="flex gap-4 p-5 rounded-[11px]"
                  style={{
                    background: "var(--warm)",
                    borderLeft: `3px solid ${v.accent}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.9rem",
                      fontWeight: 700,
                      color: "rgba(13,110,79,0.22)",
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                  >
                    {v.n}
                  </div>
                  <div>
                    <h4
                      className="mb-1"
                      style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--deep)" }}
                    >
                      {v.title}
                    </h4>
                    <p style={{ fontSize: "0.78rem", lineHeight: 1.7, color: "var(--grey)" }}>
                      {v.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team section */}
      <section className="py-[88px]" style={{ background: "var(--warm)" }}>
        <div className="section-wrap">
          <div className="eyebrow">
            <div className="ey-dash" />
            <span className="ey-txt">Leadership</span>
          </div>
          <h2
            className="mb-[48px]"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 3.8vw, 3rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "var(--deep)",
            }}
          >
            The people behind{" "}
            <em style={{ fontStyle: "italic", color: "var(--emerald)" }}>the mission</em>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
            {team.map((m) => (
              <div
                key={m.name}
                className="rounded-[13px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "#fff", border: "1px solid var(--border)" }}
              >
                <div
                  className="h-[162px] flex items-center justify-center"
                  style={{
                    background: m.bg,
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "2.8rem",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {m.initials}
                </div>
                <div className="p-4">
                  <div
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.02rem",
                      fontWeight: 700,
                      color: "var(--deep)",
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    className="mt-[3px]"
                    style={{
                      fontSize: "0.64rem",
                      letterSpacing: "0.17em",
                      textTransform: "uppercase",
                      color: "var(--mid)",
                    }}
                  >
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* <Footer minimal /> */}
    </>
  );
}