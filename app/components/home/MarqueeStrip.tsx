const items = [
  "Maternal Health",
  "Early Childhood Development",
  "Community Empowerment",
  "Sustainable Futures",
  "Generational Legacy",
  "Education & Nutrition",
  "Women in Growth",
];

export default function MarqueeStrip() {
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden py-[11px]"
      style={{
        background: "var(--deep)",
        borderTop: "1px solid rgba(52,211,153,0.07)",
        borderBottom: "1px solid rgba(52,211,153,0.07)",
      }}
    >
      <div className="inline-flex anim-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-[26px]"
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(168,230,216,0.5)",
            }}
          >
            <span
              className="w-[3px] h-[3px] rounded-full flex-shrink-0"
              style={{ background: "var(--glow)" }}
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}