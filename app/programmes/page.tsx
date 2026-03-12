// import Footer from "@/components/Footer";
import PageBanner from "../components/PageBanner";

const programmes = [
  {
    chip: "Flagship",
    num: "01",
    numColor: "rgba(255,255,255,0.12)",
    bg: "linear-gradient(160deg,#064E38,#0D6E4F)",
    chipColor: "white",
    title: "Mother & Child Care",
    desc: "Free ante & postnatal clinic visits, nutritional support packs, breastfeeding counselling, and immunisation tracking for mothers and children under five across 18 communities in Anambra State.",
    metrics: [
      { v: "1,200+", l: "Mothers Enrolled" },
      { v: "2,800+", l: "Children Screened" },
      { v: "18",     l: "Communities" },
    ],
  },
  {
    chip: "Education",
    num: "02",
    numColor: "rgba(255,255,255,0.12)",
    bg: "linear-gradient(160deg,#0D6E4F,#10B981)",
    chipColor: "white",
    title: "Legacy Learning",
    desc: "Early childhood development centres, daily school feeding, remedial tutoring, and term scholarships ensuring no child drops out due to financial hardship. Supporting 6 ECD centres and 340 scholarship recipients.",
    metrics: [
      { v: "340",  l: "Scholarships" },
      { v: "6",    l: "ECD Centres" },
      { v: "97%",  l: "Retention Rate" },
    ],
  },
  {
    chip: "Empowerment",
    num: "03",
    numColor: "rgba(0,0,0,0.12)",
    bg: "linear-gradient(160deg,#10B981,#34D399)",
    chipColor: "var(--deep)",
    title: "Women in Growth",
    desc: "12-week vocational skills training in tailoring, food processing, soap making and digital literacy, combined with cooperative savings groups, micro-loan access, and business mentorship from established women entrepreneurs.",
    metrics: [
      { v: "380+",  l: "Women Trained" },
      { v: "24",    l: "Co-op Groups" },
      { v: "₦12M+", l: "Loans Disbursed" },
    ],
  },
];

export default function ProgrammesPage() {
  return (
    <>
      <PageBanner
        label="Our Programmes"
        title={
          <>
            Planting seeds.<br />
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>Harvesting futures.</em>
          </>
        }
      />

      <section className="py-[80px] pb-[96px]">
        <div className="section-wrap">
          <div className="eyebrow">
            <div className="ey-dash" />
            <span className="ey-txt">Active Programmes</span>
          </div>
          <h2
            className="mb-[52px]"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 3.8vw, 3rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              color: "var(--deep)",
            }}
          >
            Three pillars,{" "}
            <em style={{ fontStyle: "italic", color: "var(--emerald)" }}>one mission</em>
          </h2>

          {/* Programme cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programmes.map((p) => (
              <div
                key={p.title}
                className="rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 20px var(--shadow)",
                }}
              >
                {/* Card top */}
                <div
                  className="h-[205px] p-6 flex flex-col justify-between"
                  style={{ background: p.bg }}
                >
                  <span
                    className="text-[0.56rem] tracking-[0.28em] uppercase px-3 py-[5px] rounded-[2px] self-start"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: p.chipColor,
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {p.chip}
                  </span>
                  <div
                    className="self-end"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "3.2rem",
                      fontWeight: 700,
                      color: p.numColor,
                      lineHeight: 1,
                    }}
                  >
                    {p.num}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 sm:p-[26px]">
                  <h3
                    className="mb-[10px]"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "var(--deep)",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="mb-5"
                    style={{
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: "0.84rem",
                      lineHeight: 1.82,
                      color: "var(--grey)",
                    }}
                  >
                    {p.desc}
                  </p>

                  {/* Metrics */}
                  <div
                    className="flex flex-wrap gap-5 pt-4"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    {p.metrics.map((m) => (
                      <div key={m.l}>
                        <div
                          style={{
                            fontFamily: "var(--font-cormorant), Georgia, serif",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "var(--deep)",
                            lineHeight: 1,
                          }}
                        >
                          {m.v}
                        </div>
                        <div
                          className="mt-[3px]"
                          style={{
                            fontSize: "0.62rem",
                            letterSpacing: "0.15em",
                            textTransform: "uppercase",
                            color: "var(--mgrey)",
                          }}
                        >
                          {m.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Coming soon card */}
            <div
              className="rounded-[16px] overflow-hidden flex items-center justify-center min-h-[340px]"
              style={{
                background: "var(--warm)",
                border: "2px dashed var(--border)",
              }}
            >
              <div className="text-center p-10">
                <div className="text-[2.4rem] mb-[13px]">🌱</div>
                <h3
                  className="mb-3"
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--deep)",
                  }}
                >
                  Community Grants
                </h3>
                <p
                  className="mb-4"
                  style={{
                    fontSize: "0.84rem",
                    color: "var(--grey)",
                    lineHeight: 1.75,
                    maxWidth: 300,
                    margin: "0 auto 16px",
                  }}
                >
                  Coming 2025 — Small grants for community-led health, education &amp; livelihood initiatives.
                </p>
                <span
                  className="inline-block px-[15px] py-[7px] rounded-[2px]"
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "var(--mid)",
                    border: "1px solid var(--border)",
                  }}
                >
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <Footer minimal /> */}
    </>
  );
}