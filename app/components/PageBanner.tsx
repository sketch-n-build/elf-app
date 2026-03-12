interface PageBannerProps {
  label: string;
  title: React.ReactNode;
  minHeight?: string;
  accentColor?: string;
}

export default function PageBanner({
  label,
  title,
  minHeight = "44vh",
  accentColor = "var(--glow)",
}: PageBannerProps) {
  return (
    <div
      className="flex flex-col justify-end relative overflow-hidden"
      style={{
        background: "var(--ink)",
        minHeight,
        padding: "100px 0 52px",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 18% 65%, rgba(13,110,79,0.16) 0%, transparent 65%)",
        }}
      />

      <div className="section-wrap relative z-10">
        {/* Label */}
        <div
          className="flex items-center gap-[9px] mb-[13px]"
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: accentColor,
          }}
        >
          <span className="w-5 h-px flex-shrink-0" style={{ background: accentColor }} />
          {label}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(2.4rem, 5vw, 4rem)",
            fontWeight: 600,
            color: "var(--cream)",
            lineHeight: 1.08,
          }}
        >
          {title}
        </h1>
      </div>
    </div>
  );
}