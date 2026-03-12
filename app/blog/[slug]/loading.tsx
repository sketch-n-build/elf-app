export default function BlogPostLoading() {
  return (
    <div className="min-h-[calc(100vh-68px)]" style={{ background: "var(--cream)" }}>
      {/* Hero skeleton */}
      <div
        className="relative overflow-hidden flex flex-col justify-end"
        style={{ background: "var(--ink)", minHeight: "52vh", padding: "120px 0 60px" }}
      >
        <div className="section-wrap relative z-10 max-w-[780px] mx-auto flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="shimmer w-5 h-px" style={{ background: "rgba(52,211,153,0.3)" }} />
            <div className="shimmer h-3 w-20 rounded" style={{ background: "rgba(52,211,153,0.15)" }} />
          </div>
          <div className="shimmer h-14 w-full rounded" style={{ background: "rgba(250,246,239,0.08)" }} />
          <div className="shimmer h-14 w-3/4 rounded" style={{ background: "rgba(250,246,239,0.05)" }} />
          <div className="flex gap-4 mt-2">
            <div className="shimmer w-10 h-10 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div className="flex flex-col gap-2 justify-center">
              <div className="shimmer h-3 w-28 rounded" style={{ background: "rgba(255,255,255,0.07)" }} />
              <div className="shimmer h-3 w-20 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div
        className="section-wrap py-16 max-w-[780px] mx-auto flex flex-col gap-5"
        style={{ maxWidth: 780 }}
      >
        {[100, 90, 100, 75, 85, 60, 100, 88, 70, 95].map((w, i) => (
          <div
            key={i}
            className="shimmer h-4 rounded"
            style={{
              background: "var(--warm2)",
              width: `${w}%`,
              marginTop: i === 4 ? 16 : 0,
            }}
          />
        ))}

        {/* Block quote skeleton */}
        <div
          className="shimmer rounded-[12px] h-24 mt-4"
          style={{ background: "var(--warm2)", borderLeft: "4px solid var(--border)" }}
        />

        {[100, 80, 92, 66].map((w, i) => (
          <div
            key={`b${i}`}
            className="shimmer h-4 rounded"
            style={{ background: "var(--warm2)", width: `${w}%` }}
          />
        ))}
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