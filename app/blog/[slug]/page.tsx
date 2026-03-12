import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogPost } from "@/app/lib/types/Blog";
import { formatDate, readingTime } from "@/app/lib/blog-utils";
// import Footer from "@/components/Footer";
// import { BlogPost } from "../lib/types/Blog";
// import { formatDate, readingTime } from "../lib/blog-utils";

/* ─── Mock data ─────────────────────────────────────────────────────────
   Replace with:
     const post = await prisma.blog.findUnique({
       where: { slug, isPublished: true },
       include: { author: { select: { id, name, email, image } } },
     });
     if (!post) notFound();
──────────────────────────────────────────────────────────────────────── */
const MOCK_POSTS: Record<string, BlogPost> = {
  "community-health-workers-maternal-care-onitsha": {
    id: "1",
    title: "How Community Health Workers Are Transforming Maternal Care in Onitsha",
    slug: "community-health-workers-maternal-care-onitsha",
    excerpt:
      "Our trained community health workers visit over 200 homes each month, providing care that the formal health system alone cannot reach.",
    content: `
## The Challenge

Maternal mortality remains a stubborn reality across Nigeria. In Anambra State, many women still give birth without skilled attendance — not because they don't want care, but because care cannot reach them. Distance, cost, and cultural barriers form a wall too high for many families to climb alone.

## How We Responded

Eleje Legacy trained and deployed **18 community health workers** (CHWs) across our programme communities in 2024. Each CHW is a trusted member of their own community — a neighbour, a fellow mother. They speak the language, they understand the culture, and they are already trusted.

Each CHW carries a programme kit including:
- Iron and folic acid supplements
- Oral rehydration salts
- Basic growth monitoring tools
- Immunisation tracking cards
- Emergency referral contacts

> "When Mama Chidinma visited me in my third trimester, I felt seen for the first time. She didn't just give me supplements — she sat with me, listened to my fears, and explained everything in Igbo. That changed everything." — Programme beneficiary, Oguta Road

## What the Numbers Show

In our first year of deploying community health workers:

- **1,200+ mothers** received at least 4 antenatal visits
- **89% immunisation compliance** among children under five in CHW catchment areas
- **Zero maternal deaths** recorded within our enrolled cohort in Q3–Q4 2025

## Looking Forward

We are scaling this model. By end of 2026, we aim to deploy 36 CHWs across 24 communities. But we need your support to make it happen. Each CHW costs approximately **₦180,000 per year** to train, equip, and support.

If every reader of this article donated ₦5,000, we could fund three additional CHWs for an entire year.

Every mother deserves care. Every community deserves health workers who look like them and love them.
    `.trim(),
    coverImage: null,
    isPublished: true,
    authorId: "u1",
    author: { id: "u1", name: "Amara Okonkwo", email: "amara@eleje.ng" },
    publishedAt: "2026-02-14T10:00:00Z",
    createdAt:   "2026-02-14T10:00:00Z",
    updatedAt:   "2026-02-14T10:00:00Z",
  },
};

/* Simple markdown-to-JSX renderer (no library dependency) */
function renderMarkdown(md: string): React.ReactNode[] {
  const lines  = md.split("\n");
  const nodes: React.ReactNode[] = [];
  let   i      = 0;

  const inlineRender = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} style={{ color: "var(--deep)", fontWeight: 600 }}>{p.slice(2, -2)}</strong>
        : p
    );
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) { i++; continue; }

    if (line.startsWith("## ")) {
      nodes.push(
        <h2
          key={i}
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)",
            fontWeight: 700,
            color: "var(--deep)",
            lineHeight: 1.2,
            marginTop: "2.2rem",
            marginBottom: "1rem",
          }}
        >
          {line.slice(3)}
        </h2>
      );
      i++; continue;
    }

    if (line.startsWith("> ")) {
      nodes.push(
        <blockquote
          key={i}
          className="my-8 pl-5 py-4 rounded-r-[12px]"
          style={{
            borderLeft: "4px solid var(--gold)",
            background: "var(--warm2)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-lora), Georgia, serif",
              fontStyle: "italic",
              fontSize: "1.02rem",
              lineHeight: 1.78,
              color: "var(--deep)",
            }}
          >
            {line.slice(2)}
          </p>
        </blockquote>
      );
      i++; continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-4 flex flex-col gap-[9px]">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <span
                className="mt-[6px] w-[5px] h-[5px] rounded-full flex-shrink-0"
                style={{ background: "var(--mid)" }}
              />
              <span
                style={{
                  fontFamily: "var(--font-lora), Georgia, serif",
                  fontSize: "0.95rem",
                  lineHeight: 1.75,
                  color: "var(--grey)",
                }}
              >
                {inlineRender(item)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    nodes.push(
      <p
        key={i}
        className="my-4"
        style={{
          fontFamily: "var(--font-lora), Georgia, serif",
          fontSize: "0.97rem",
          lineHeight: 1.92,
          color: "var(--grey)",
        }}
      >
        {inlineRender(line)}
      </p>
    );
    i++;
  }
  return nodes;
}

/* ─── Related posts stub ──────────────────────────────────────────────── */
const RELATED = [
  {
    title: "The Legacy Learning Programme: A Year in Numbers",
    slug:  "legacy-learning-programme-year-in-numbers",
    excerpt: "340 scholarships, 6 ECD centres, and a 97% retention rate.",
    author: "Chidi Ezenwachi",
    publishedAt: "2026-01-28T09:00:00Z",
    bg: "linear-gradient(140deg,#0D6E4F,#10B981)",
  },
  {
    title: "Understanding Childhood Malnutrition: What Every Mother Should Know",
    slug:  "understanding-childhood-malnutrition",
    excerpt: "Malnutrition remains one of the leading causes of preventable child death in Nigeria.",
    author: "Ngozi Umezurike",
    publishedAt: "2025-12-20T08:00:00Z",
    bg: "linear-gradient(140deg,#064E38,#0D6E4F)",
  },
];

/* ─── Page ─────────────────────────────────────────────────────────────── */
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  /* Replace with Prisma query */
  const post = MOCK_POSTS[slug];
  if (!post) notFound();

  const authorInitials = post.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const authorGradients = [
    "linear-gradient(135deg,#064E38,#10B981)",
    "linear-gradient(135deg,#0D6E4F,#34D399)",
    "linear-gradient(135deg,#C9A84C,#8B6914)",
    "linear-gradient(135deg,#148a80,#064E38)",
  ];
  const authorBg = authorGradients[post.authorId.charCodeAt(1) % authorGradients.length];

  return (
    <>
      {/* ── Hero banner ───────────────────────────────────── */}
      <div
        className="relative overflow-hidden flex flex-col justify-end"
        style={{
          background: "var(--ink)",
          minHeight: "52vh",
          padding: "120px 0 60px",
        }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 60% at 20% 70%, rgba(13,110,79,0.18) 0%, transparent 65%)",
          }}
        />
        {/* Decorative SVG */}
        <svg
          className="absolute right-0 top-0 opacity-[0.04]"
          width="420"
          height="480"
          viewBox="0 0 60 68"
          fill="white"
        >
          <circle cx="38" cy="10" r="9" />
          <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" />
          <circle cx="16" cy="24" r="7.5" />
          <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" />
        </svg>

        <div className="section-wrap relative z-10" style={{ maxWidth: 800 }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6" style={{ fontSize: "0.66rem", letterSpacing: "0.18em" }}>
            <Link href="/blog" style={{ color: "rgba(168,230,216,0.5)", textTransform: "uppercase" }}>
              Blog
            </Link>
            <span style={{ color: "rgba(168,230,216,0.25)" }}>›</span>
            <span style={{ color: "var(--glow)", textTransform: "uppercase" }}>Article</span>
          </div>

          {/* Category & date */}
          <div className="flex items-center gap-[9px] mb-5">
            <span className="w-5 h-px flex-shrink-0" style={{ background: "var(--glow)" }} />
            <span
              style={{
                fontSize: "0.62rem",
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "var(--glow)",
              }}
            >
              {formatDate(post.publishedAt)} · {readingTime(post.content)}
            </span>
          </div>

          {/* Title */}
          <h1
            className="mb-7"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
              fontWeight: 700,
              color: "var(--cream)",
              lineHeight: 1.1,
              maxWidth: 680,
            }}
          >
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{
                background: authorBg,
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1rem",
              }}
            >
              {authorInitials}
            </div>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--pale)" }}>
                {post.author.name}
              </div>
              <div style={{ fontSize: "0.66rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--mgrey)", marginTop: 2 }}>
                Eleje Legacy Team
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Excerpt pull-quote ────────────────────────────── */}
      {post.excerpt && (
        <div style={{ background: "var(--warm)", borderBottom: "1px solid var(--border)" }}>
          <div className="section-wrap py-8" style={{ maxWidth: 800 }}>
            <p
              style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontStyle: "italic",
                fontSize: "1.08rem",
                lineHeight: 1.75,
                color: "var(--emerald)",
              }}
            >
              {post.excerpt}
            </p>
          </div>
        </div>
      )}

      {/* ── Article body ─────────────────────────────────── */}
      <article className="section-wrap py-14 pb-20" style={{ maxWidth: 800 }}>
        {renderMarkdown(post.content)}

        {/* Share / CTA strip */}
        <div
          className="mt-14 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="mb-1"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--deep)",
              }}
            >
              Did this story move you?
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--grey)" }}>
              Support the work behind it.
            </p>
          </div>
          <Link
            href="/donate"
            className="inline-flex items-center gap-[9px] px-[28px] py-[13px] rounded-[4px] text-[0.68rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px] hover:brightness-110 flex-shrink-0"
            style={{ background: "var(--gold)", color: "var(--ink)" }}
          >
            Donate Now →
          </Link>
        </div>
      </article>

      {/* ── Related posts ────────────────────────────────── */}
      <section style={{ background: "var(--warm)", borderTop: "1px solid var(--border)" }}>
        <div className="section-wrap py-16">
          <div className="eyebrow mb-6">
            <div className="ey-dash" />
            <span className="ey-txt">Keep Reading</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {RELATED.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group block rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "#fff", border: "1px solid var(--border)" }}
              >
                <div className="h-[120px] flex items-end p-5" style={{ background: r.bg }}>
                  <span
                    className="text-[0.52rem] tracking-[0.25em] uppercase px-3 py-[4px] rounded-[2px]"
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  >
                    Article
                  </span>
                </div>
                <div className="p-5">
                  <h4
                    className="mb-2 group-hover:text-[var(--emerald)] transition-colors duration-200"
                    style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "1.12rem",
                      fontWeight: 700,
                      color: "var(--deep)",
                      lineHeight: 1.22,
                    }}
                  >
                    {r.title}
                  </h4>
                  <p
                    className="mb-4 line-clamp-2"
                    style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "var(--grey)" }}
                  >
                    {r.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: "0.7rem", color: "var(--mgrey)" }}>
                      {formatDate(r.publishedAt)}
                    </span>
                    <span className="pcard-link text-[0.6rem]">Read →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-[9px] px-[28px] py-[12px] rounded-[4px] text-[0.68rem] font-medium tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                border: "1px solid var(--border)",
                color: "var(--grey)",
                background: "transparent",
              }}
            >
              ← All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* <Footer minimal /> */}
    </>
  );
}

/* Generate static params for known slugs in production - This will help for SEO*/
export async function generateStaticParams() {
  /* Replace with:
     const posts = await prisma.blog.findMany({
       where: { isPublished: true },
       select: { slug: true },
     });
     return posts.map((p) => ({ slug: p.slug }));
  */
  return Object.keys(MOCK_POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = MOCK_POSTS[slug];
  if (!post) return {};
  return {
    title: `${post.title} — Eleje Legacy Blog`,
    description: post.excerpt ?? undefined,
  };
}