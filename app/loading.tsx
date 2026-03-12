export default function Loading() {
  return (
    <div
      className="min-h-[calc(100vh-68px)] flex flex-col"
      style={{ background: "var(--cream)" }}
    >
      {/* Animated page banner skeleton */}
      <div
        className="relative overflow-hidden flex flex-col justify-end"
        style={{
          background: "var(--ink)",
          minHeight: "38vh",
          padding: "100px 0 52px",
        }}
      >
        {/* Subtle glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 18% 65%, rgba(13,110,79,0.10) 0%, transparent 65%)",
          }}
        />
        <div className="section-wrap relative z-10 flex flex-col gap-4">
          {/* Label skeleton */}
          <div className="flex items-center gap-[9px]">
            <div className="shimmer w-5 h-px" style={{ background: "rgba(52,211,153,0.3)" }} />
            <div className="shimmer h-3 w-32 rounded" style={{ background: "rgba(52,211,153,0.15)" }} />
          </div>
          {/* Title skeleton */}
          <div className="shimmer h-12 w-72 rounded" style={{ background: "rgba(250,246,239,0.07)" }} />
          <div className="shimmer h-12 w-48 rounded" style={{ background: "rgba(250,246,239,0.05)" }} />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="section-wrap py-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[16px] overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "#fff",
                opacity: 1 - i * 0.08,
              }}
            >
              {/* Image area */}
              <div
                className="shimmer h-48"
                style={{ background: "var(--warm2)" }}
              />
              {/* Body */}
              <div className="p-5 flex flex-col gap-3">
                <div className="shimmer h-3 w-20 rounded" style={{ background: "var(--warm2)" }} />
                <div className="shimmer h-6 w-full rounded" style={{ background: "var(--warm2)" }} />
                <div className="shimmer h-4 w-4/5 rounded" style={{ background: "var(--warm)" }} />
                <div className="shimmer h-4 w-3/5 rounded" style={{ background: "var(--warm)" }} />
                <div className="flex items-center gap-2 mt-2">
                  <div className="shimmer w-8 h-8 rounded-full" style={{ background: "var(--warm2)" }} />
                  <div className="shimmer h-3 w-24 rounded" style={{ background: "var(--warm)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.35) 50%,
            transparent 100%
          );
          animation: shimmerMove 1.6s ease-in-out infinite;
        }
        @keyframes shimmerMove {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}