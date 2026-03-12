export default function BlogLoading() {
  return (
    <div className="min-h-[calc(100vh-68px)]" style={{ background: "var(--cream)" }}>
      {/* Banner skeleton */}
      <div
        className="relative overflow-hidden flex flex-col justify-end"
        style={{ background: "var(--ink)", minHeight: "38vh", padding: "100px 0 52px" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 18% 65%, rgba(13,110,79,0.10) 0%, transparent 65%)",
          }}
        />
        <div className="section-wrap relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="shimmer w-5 h-px" style={{ background: "rgba(52,211,153,0.3)" }} />
            <div className="shimmer h-3 w-24 rounded" style={{ background: "rgba(52,211,153,0.15)" }} />
          </div>
          <div className="shimmer h-12 w-80 rounded" style={{ background: "rgba(250,246,239,0.07)" }} />
          <div className="shimmer h-8 w-56 rounded" style={{ background: "rgba(250,246,239,0.04)" }} />
        </div>
      </div>

      {/* Filter bar skeleton */}
      <div style={{ background: "var(--warm)", borderBottom: "1px solid var(--border)" }}>
        <div className="section-wrap py-5">
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shimmer h-8 w-20 rounded-full"
                style={{ background: "var(--border)" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="section-wrap py-16">
        {/* Featured card */}
        <div
          className="shimmer rounded-[20px] mb-12 h-[420px] w-full"
          style={{ background: "var(--warm2)" }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[16px] overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "#fff",
                opacity: 1 - i * 0.07,
              }}
            >
              <div className="shimmer h-48" style={{ background: "var(--warm2)" }} />
              <div className="p-5 flex flex-col gap-3">
                <div className="shimmer h-3 w-16 rounded" style={{ background: "var(--warm2)" }} />
                <div className="shimmer h-6 w-full rounded" style={{ background: "var(--warm2)" }} />
                <div className="shimmer h-4 w-4/5 rounded" style={{ background: "var(--warm)" }} />
                <div className="shimmer h-4 w-3/5 rounded" style={{ background: "var(--warm)" }} />
                <div className="flex items-center gap-2 mt-1">
                  <div className="shimmer w-8 h-8 rounded-full" style={{ background: "var(--warm2)" }} />
                  <div className="shimmer h-3 w-24 rounded" style={{ background: "var(--warm)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .shimmer { position: relative; overflow: hidden; }
        .shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
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