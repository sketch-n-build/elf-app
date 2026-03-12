import Link from "next/link";
// import Footer from "@/components/Footer";
import PageBanner from "../components/PageBanner";
import BlogGrid from "../components/blog/BlogGrid";
import { BlogPost } from "../lib/types/Blog";
// import BlogGrid from "@/components/blog/BlogGrid";
// import { BlogPost } from "@/types/blog";

/* ─── Mock data — replace with Prisma query ──────────────────────────────
   Example:
     const posts = await prisma.blog.findMany({
       where: { isPublished: true },
       include: { author: { select: { id: true, name: true, email: true, image: true } } },
       orderBy: { publishedAt: "desc" },
     });
──────────────────────────────────────────────────────────────────────── */
const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "How Community Health Workers Are Transforming Maternal Care in Onitsha",
    slug: "community-health-workers-maternal-care-onitsha",
    excerpt:
      "Our trained community health workers visit over 200 homes each month, providing care that the formal health system alone cannot reach.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u1",
    author: { id: "u1", name: "Amara Okonkwo", email: "amara@eleje.ng" },
    publishedAt: "2026-02-14T10:00:00Z",
    createdAt:   "2026-02-14T10:00:00Z",
    updatedAt:   "2026-02-14T10:00:00Z",
  },
  {
    id: "2",
    title: "The Legacy Learning Programme: A Year in Numbers",
    slug: "legacy-learning-programme-year-in-numbers",
    excerpt:
      "340 scholarships, 6 ECD centres, and a 97% retention rate. Here is what our education programme achieved in its first full year.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u2",
    author: { id: "u2", name: "Chidi Ezenwachi", email: "chidi@eleje.ng" },
    publishedAt: "2026-01-28T09:00:00Z",
    createdAt:   "2026-01-28T09:00:00Z",
    updatedAt:   "2026-01-28T09:00:00Z",
  },
  {
    id: "3",
    title: "Women in Growth: Stories from Our Vocational Training Graduates",
    slug: "women-in-growth-vocational-training-stories",
    excerpt:
      "From learning to sew to running a tailoring cooperative — meet three women whose lives changed after completing our 12-week programme.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u1",
    author: { id: "u1", name: "Amara Okonkwo", email: "amara@eleje.ng" },
    publishedAt: "2026-01-10T11:00:00Z",
    createdAt:   "2026-01-10T11:00:00Z",
    updatedAt:   "2026-01-10T11:00:00Z",
  },
  {
    id: "4",
    title: "Understanding Childhood Malnutrition: What Every Mother Should Know",
    slug: "understanding-childhood-malnutrition",
    excerpt:
      "Malnutrition remains one of the leading causes of preventable child death in Nigeria. We break down the signs, causes, and what to do.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u3",
    author: { id: "u3", name: "Ngozi Umezurike", email: "ngozi@eleje.ng" },
    publishedAt: "2025-12-20T08:00:00Z",
    createdAt:   "2025-12-20T08:00:00Z",
    updatedAt:   "2025-12-20T08:00:00Z",
  },
  {
    id: "5",
    title: "Why We Believe in Community Grants: A Case for Local Ownership",
    slug: "community-grants-local-ownership",
    excerpt:
      "Our upcoming Community Grants programme is built on a simple idea: local people understand local problems better than anyone.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u4",
    author: { id: "u4", name: "Ifeanyi Agu", email: "ifeanyi@eleje.ng" },
    publishedAt: "2025-12-05T14:00:00Z",
    createdAt:   "2025-12-05T14:00:00Z",
    updatedAt:   "2025-12-05T14:00:00Z",
  },
  {
    id: "6",
    title: "Our 2025 Annual Report: Growth, Challenges & What Comes Next",
    slug: "2025-annual-report",
    excerpt:
      "A candid look at our first year — what we achieved, where we fell short, and the bold plans we have for 2026.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u1",
    author: { id: "u1", name: "Amara Okonkwo", email: "amara@eleje.ng" },
    publishedAt: "2025-11-30T10:00:00Z",
    createdAt:   "2025-11-30T10:00:00Z",
    updatedAt:   "2025-11-30T10:00:00Z",
  },
  {
    id: "7",
    title: "Antenatal Care in Rural Communities: Closing the Gap",
    slug: "antenatal-care-rural-communities",
    excerpt:
      "Distance, cost, and cultural barriers keep many women from accessing antenatal care. Here is how we're working to change that.",
    content: "Full content here...",
    coverImage: null,
    isPublished: true,
    authorId: "u2",
    author: { id: "u2", name: "Chidi Ezenwachi", email: "chidi@eleje.ng" },
    publishedAt: "2025-11-15T09:00:00Z",
    createdAt:   "2025-11-15T09:00:00Z",
    updatedAt:   "2025-11-15T09:00:00Z",
  },
];

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function BlogPage() {
  const [featured, ...rest] = mockPosts;

  return (
    <>
      <PageBanner
        label="Insights & Stories"
        title={
          <>
            Words that plant{" "}
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>seeds.</em>
          </>
        }
        minHeight="38vh"
      />

      {/* Stats bar */}
      <div
        style={{
          background: "var(--deep)",
          borderBottom: "1px solid rgba(52,211,153,0.09)",
        }}
      >
        <div className="section-wrap py-5">
          <div className="flex flex-wrap items-center gap-8">
            {[
              { n: `${mockPosts.length}`, l: "Articles Published" },
              { n: "4",   l: "Authors" },
              { n: "2026", l: "Latest Year" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--pale)",
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(168,230,216,0.45)",
                  }}
                >
                  {s.l}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="section-wrap py-16 pb-24">
        {/* Featured post */}
        {featured && (
          <div className="mb-14">
            <div className="eyebrow mb-5">
              <div className="ey-dash" />
              <span className="ey-txt">Featured Story</span>
            </div>
            <Link href={`/blog/${featured.slug}`}>
              <div
                className="group grid grid-cols-1 lg:grid-cols-[1fr_1fr] rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 36px var(--shadow)",
                }}
              >
                {/* Cover / colour block */}
                <div
                  className="min-h-[260px] lg:min-h-[380px] relative overflow-hidden flex items-end p-8"
                  style={{
                    background: "linear-gradient(140deg, var(--deep) 0%, var(--emerald) 60%, #34D399 100%)",
                  }}
                >
                  {/* Decorative circles */}
                  <div
                    className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-10"
                    style={{ border: "1px solid var(--pale)" }}
                  />
                  <div
                    className="absolute top-14 right-14 w-20 h-20 rounded-full opacity-10"
                    style={{ border: "1px solid var(--glow)" }}
                  />
                  {/* Big SVG mark */}
                  <svg
                    className="absolute bottom-6 right-6 opacity-10"
                    width="140"
                    height="160"
                    viewBox="0 0 60 68"
                    fill="white"
                  >
                    <circle cx="38" cy="10" r="9" />
                    <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
                    <circle cx="16" cy="24" r="7.5" />
                    <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
                  </svg>

                  <span
                    className="relative z-10 text-[0.56rem] tracking-[0.28em] uppercase px-3 py-[5px] rounded-[2px]"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    Featured
                  </span>
                </div>

                {/* Body */}
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <div
                    className="mb-4 text-xs tracking-[0.2em] uppercase"
                    style={{ color: "var(--mid)" }}
                  >
                    {new Date(featured.publishedAt as string).toLocaleDateString("en-NG", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </div>
                  <h2
                    className="mb-4 group-hover:text-[var(--emerald)] transition-colors duration-200"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                      fontWeight: 700,
                      color: "var(--deep)",
                      lineHeight: 1.18,
                    }}
                  >
                    {featured.title}
                  </h2>
                  <p
                    className="mb-6"
                    style={{
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: "0.9rem",
                      lineHeight: 1.82,
                      color: "var(--grey)",
                    }}
                  >
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, var(--deep), var(--emerald))",
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                        }}
                      >
                        {featured.author.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 500, color: "var(--deep)" }}>
                          {featured.author.name}
                        </div>
                        <div style={{ fontSize: "0.66rem", color: "var(--mgrey)", marginTop: 1 }}>
                          Eleje Legacy Team
                        </div>
                      </div>
                    </div>
                    <span className="pcard-link">Read Article →</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All posts grid — client for filtering */}
        <div className="eyebrow mb-8">
          <div className="ey-dash" />
          <span className="ey-txt">All Articles</span>
        </div>

        <BlogGrid posts={rest} />
      </div>

      {/* <Footer /> */}
    </>
  );
}