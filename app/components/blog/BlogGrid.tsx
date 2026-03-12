"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BlogPost } from "@/app/lib/types/Blog";
import { formatDate, readingTime } from "@/app/lib/blog-utils";
// import { BlogPost } from "@/types/blog";
// import { formatDate, readingTime } from "@/lib/blog-utils";

const CATEGORIES = ["All", "Health", "Education", "Empowerment", "Reports", "Community"];

interface BlogGridProps {
  posts: BlogPost[];
}

function categoryFromPost(post: BlogPost): string {
  const t = post.title.toLowerCase();
  if (t.includes("health") || t.includes("antenatal") || t.includes("nutrition") || t.includes("malnutrition")) return "Health";
  if (t.includes("learn") || t.includes("school") || t.includes("education")) return "Education";
  if (t.includes("women") || t.includes("vocational") || t.includes("growth")) return "Empowerment";
  if (t.includes("report") || t.includes("annual")) return "Reports";
  return "Community";
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [active, setActive] = useState("All");

  const filtered = useMemo(
    () =>
      active === "All"
        ? posts
        : posts.filter((p) => categoryFromPost(p) === active),
    [active, posts]
  );

  const gradients: Record<string, string> = {
    Health:      "linear-gradient(140deg,#064E38,#0D6E4F)",
    Education:   "linear-gradient(140deg,#0D6E4F,#10B981)",
    Empowerment: "linear-gradient(140deg,#10B981,#34D399)",
    Reports:     "linear-gradient(140deg,#064E38,#C9A84C)",
    Community:   "linear-gradient(140deg,#0D6E4F,#34D399)",
  };

  return (
    <>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-[9px] mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className="px-[18px] py-[7px] rounded-full text-[0.62rem] tracking-[0.2em] uppercase transition-all duration-200"
            style={
              active === cat
                ? {
                    background: "var(--deep)",
                    color: "var(--pale)",
                    border: "1px solid var(--deep)",
                    fontFamily: "var(--font-jost), sans-serif",
                  }
                : {
                    background: "transparent",
                    color: "var(--grey)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--font-jost), sans-serif",
                  }
            }
          >
            {cat}
          </button>
        ))}
        <span
          className="ml-auto self-center"
          style={{ fontSize: "0.72rem", color: "var(--mgrey)" }}
        >
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 rounded-[16px] text-center"
          style={{ background: "var(--warm)", border: "1px dashed var(--border)" }}
        >
          <div className="text-4xl mb-4">🌱</div>
          <p style={{ color: "var(--mgrey)", fontSize: "0.9rem" }}>
            No articles in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, i) => {
            const cat   = categoryFromPost(post);
            const grad  = gradients[cat] ?? gradients["Community"];
            const initl = post.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-[5px] hover:shadow-xl"
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  animationDelay: `${i * 60}ms`,
                }}
              >
                {/* Cover */}
                <div
                  className="h-[188px] flex items-end justify-between p-5 relative overflow-hidden"
                  style={{ background: grad }}
                >
                  {/* Subtle logo watermark */}
                  <svg
                    className="absolute -bottom-4 -right-4 opacity-[0.10]"
                    width="100"
                    height="110"
                    viewBox="0 0 60 68"
                    fill="white"
                  >
                    <circle cx="38" cy="10" r="9" />
                    <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
                    <circle cx="16" cy="24" r="7.5" />
                    <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
                  </svg>

                  <span
                    className="relative z-10 text-[0.54rem] tracking-[0.25em] uppercase px-3 py-[4px] rounded-[2px]"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    {cat}
                  </span>
                  <span
                    className="relative z-10 text-[0.58rem]"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "var(--font-jost), sans-serif",
                    }}
                  >
                    {readingTime(post.content)}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 pb-6">
                  <div
                    className="mb-2 text-[0.6rem] tracking-[0.18em] uppercase"
                    style={{ color: "var(--mgrey)" }}
                  >
                    {formatDate(post.publishedAt)}
                  </div>
                  <h3
                    className="mb-3 group-hover:text-[var(--emerald)] transition-colors duration-200"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.22rem",
                      fontWeight: 700,
                      color: "var(--deep)",
                      lineHeight: 1.22,
                    }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="mb-5 line-clamp-2"
                    style={{
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: "0.82rem",
                      lineHeight: 1.75,
                      color: "var(--grey)",
                    }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Author + read link */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[9px]">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, var(--deep), var(--emerald))",
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontSize: "0.7rem",
                        }}
                      >
                        {initl}
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "var(--deep)", fontWeight: 500 }}>
                        {post.author.name.split(" ")[0]}
                      </span>
                    </div>
                    <span className="pcard-link text-[0.62rem]">Read →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}