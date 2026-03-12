// import Footer from "@/components/Footer";
import PageBanner from "../components/PageBanner";
import DonateForm from "../components/donate/DonateForm";

const impactItems = [
  { amount: "₦5,000",   text: "feeds one child nutritious meals for an entire month through our school feeding programme." },
  { amount: "₦20,000",  text: "covers a mother's full year of antenatal and postnatal health visits, including medications." },
  { amount: "₦50,000",  text: "sponsors one child's entire school term — fees, books, uniform and daily meals included." },
  { amount: "₦100,000", text: "trains and equips one woman with vocational skills and her first micro-loan." },
];

const trustBadges = [
  { icon: "📋", label: "CAC Registered" },
  { icon: "📊", label: "Reports Published" },
  { icon: "🔍", label: "Independently Audited" },
  { icon: "💯", label: "100% to Programmes" },
];

export default function DonatePage() {
  return (
    <>
      <PageBanner
        label="Support Our Work"
        title={
          <>
            Give a child{" "}
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>a future.</em>
          </>
        }
        minHeight="38vh"
        accentColor="var(--gold-lt)"
      />

      <div className="section-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-[52px] items-start py-[72px] pb-[96px]">
          {/* Client donate form */}
          <DonateForm />

          {/* Right sidebar */}
          <div>
            <h3
              className="mb-5"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "var(--deep)",
              }}
            >
              Your gift makes this possible
            </h3>

            {/* Impact list */}
            <ul className="list-none flex flex-col gap-[13px] mb-8">
              {impactItems.map((item) => (
                <li key={item.amount} className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-[2px]"
                    style={{
                      background: "var(--warm)",
                      border: "1px solid var(--mid)",
                      fontSize: "0.58rem",
                      color: "var(--mid)",
                    }}
                  >
                    ✓
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: "0.84rem",
                      lineHeight: 1.65,
                      color: "var(--grey)",
                    }}
                  >
                    <strong style={{ color: "var(--deep)" }}>{item.amount}</strong>{" "}
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* Trust badges */}
            <h4
              className="mb-3"
              style={{
                fontSize: "0.64rem",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--emerald)",
              }}
            >
              Why Trust Us
            </h4>
            <div className="flex flex-wrap gap-[9px] mb-[26px]">
              {trustBadges.map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-[6px] px-3 py-2 rounded-[7px] text-[0.68rem]"
                  style={{
                    background: "var(--warm)",
                    border: "1px solid var(--border)",
                    color: "var(--grey)",
                  }}
                >
                  <span>{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>

            {/* Quote */}
            <div
              className="rounded-[13px] p-6"
              style={{
                background: "var(--warm2)",
                borderLeft: "3px solid var(--gold)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "0.97rem",
                  lineHeight: 1.75,
                  color: "var(--deep)",
                }}
              >
                "Every generation plants trees under whose shade they shall never sit — that is the meaning of legacy."
              </p>
              <p
                className="mt-3"
                style={{
                  fontSize: "0.62rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                }}
              >
                — Eleje Legacy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer minimal /> */}
    </>
  );
}