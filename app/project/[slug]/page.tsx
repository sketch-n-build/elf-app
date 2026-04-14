import { notFound } from "next/navigation";
import Link from "next/link";
// import Footer from "@/components/Footer";
// import { Project } from "@/types/project";
import {
  statusLabel,
  statusColor,
  progressPercent,
  formatNaira,
  formatDate,
  formatDateShort,
  fullName,
  initials,
} from "@/lib/project-utils";
import { Project } from "@/lib/types/Project";

/* ─── Mock data — replace with Prisma query ──────────────────────────────
   const project = await prisma.project.findUnique({
     where: { slug },
     include: {
       createdBy: {
         select: { id: true, firstName: true, lastName: true, email: true,
                   profile: { select: { avatarUrl: true } } },
       },
       updates: { orderBy: { createdAt: "desc" } },
       investments: {
         select: { amount: true },
       },
     },
   });
   if (!project) notFound();
──────────────────────────────────────────────────────────────────────── */
const mockProjects: Project[] = [
  {
    id: "p1",
    title: "Mother & Child Wellness Outreach",
    slug: "mother-child-wellness-outreach",
    description: `## The Challenge

Maternal mortality remains a stubborn reality across Nigeria. In Ebonyi South, over 60% of mothers give birth without skilled birth attendance. Postnatal care visits are rare, and childhood malnutrition is highest in the 6–24 month window.

## What We Do

Our community health workers conduct monthly home visits to registered families. Each visit covers postnatal recovery checks, infant feeding guidance, nutritional assessments, and emotional wellbeing support for new mothers.

> "I did not know that my baby's weight was supposed to be checked every month. Now I come to the clinic and I bring my neighbours too." — Blessing, programme participant

## Our Approach

We recruit and train community health workers directly from the communities we serve. They receive a 6-week certified training course, monthly refresher sessions, and a modest stipend that recognises their contribution.

## What We've Achieved

Since launching in June 2024, we have reached 412 families across 8 communities. Childhood malnutrition rates in our target areas have dropped by 34% based on mid-programme evaluations.

## What's Next

We are expanding to 3 additional communities in the second half of 2026, with a target of 600 families by year-end.`,
    coverImage: null,
    goalAmount: 12000000,
    currentAmount: 8400000,
    status: "ACTIVE",
    isFeatured: true,
    createdById: "u1",
    createdBy: {
      id: "u1",
      firstName: "Amara",
      lastName: "Okonkwo",
      email: "amara@eleje.ng",
    },
    updates: [
      {
        id: "upd3",
        projectId: "p1",
        title: "Q1 2026 — 412 Families Reached",
        content:
          "This quarter we reached our highest monthly visit count. We have now served 412 families, up from 280 at the same point last year. Three new community health workers were certified and deployed.",
        image: null,
        createdAt: "2026-02-01T00:00:00Z",
      },
      {
        id: "upd2",
        projectId: "p1",
        title: "Malnutrition Rates Down 34%",
        content:
          "Mid-programme evaluation results are in. In our 8 target communities, childhood malnutrition (stunting + wasting combined) has fallen by 34% compared to our baseline measurement in June 2024.",
        image: null,
        createdAt: "2025-10-15T00:00:00Z",
      },
      {
        id: "upd1",
        projectId: "p1",
        title: "Programme Launch — June 2024",
        content:
          "We are proud to announce the launch of the Mother & Child Wellness Outreach programme. Our first cohort of 12 community health workers has completed training and will begin home visits this month.",
        image: null,
        createdAt: "2024-06-15T00:00:00Z",
      },
    ],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
];

export async function generateStaticParams() {
  /* Replace with:
     const projects = await prisma.project.findMany({ select: { slug: true } });
     return projects.map((p) => ({ slug: p.slug }));
  */
  return mockProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const project = mockProjects.find((p) => p.slug === params.slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | Eleje Legacy`,
  };
}

/* ─── Markdown renderer ──────────────────────────────────────────────── */
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={key++}
          className="mt-8 mb-3"
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "clamp(1.4rem, 2.4vw, 1.75rem)",
            fontWeight: 700,
            color: "var(--deep)",
            lineHeight: 1.2,
          }}
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={key++}
          className="my-6 pl-5 py-1"
          style={{
            borderLeft: "3px solid var(--glow)",
            fontFamily: "var(--font-lora), Georgia, serif",
            fontStyle: "italic",
            fontSize: "1rem",
            lineHeight: 1.8,
            color: "var(--grey)",
          }}
        >
          {line.slice(2)}
        </blockquote>,
      );
    } else if (line.startsWith("- ")) {
      const items = [line.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("- ")) {
        i++;
        items.push(lines[i].trim().slice(2));
      }
      elements.push(
        <ul
          key={key++}
          className="my-3 pl-4 flex flex-col gap-[6px]"
          style={{ listStyleType: "disc", color: "var(--grey)" }}
        >
          {items.map((it, j) => (
            <li
              key={j}
              style={{
                fontFamily: "var(--font-lora), Georgia, serif",
                fontSize: "0.92rem",
                lineHeight: 1.8,
              }}
            >
              {it}
            </li>
          ))}
        </ul>,
      );
    } else {
      const html = line.replace(
        /\*\*(.*?)\*\*/g,
        `<strong style="color:var(--deep);font-weight:600">$1</strong>`,
      );
      elements.push(
        <p
          key={key++}
          className="mb-[17px]"
          style={{
            fontFamily: "var(--font-lora), Georgia, serif",
            fontSize: "0.93rem",
            lineHeight: 2,
            color: "var(--grey)",
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />,
      );
    }
  }
  return elements;
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default async function SingleProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const project = mockProjects.find((p) => p.slug == slug);
  if (!project) notFound();

  const pct = progressPercent(project.currentAmount, project.goalAmount);
  const init = initials(project.createdBy);
  const name = fullName(project.createdBy);

  return (
    <>
      {/* ── Dark hero ────────────────────────────────────────── */}
      <div
        className="w-full relative overflow-hidden flex flex-col justify-end"
        style={{
          minHeight: "48vh",
          background: "linear-gradient(160deg, var(--deep) 0%, #06241A 100%)",
          paddingTop: "68px",
        }}
      >
        <div
          className="absolute top-12 right-12 w-64 h-64 rounded-full opacity-[0.05]"
          style={{ border: "1px solid var(--pale)" }}
        />
        <div
          className="absolute top-24 right-24 w-40 h-40 rounded-full opacity-[0.05]"
          style={{ border: "1px solid var(--glow)" }}
        />

        <div className="section-wrap pb-12 pt-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              href="/projects"
              className="text-[0.62rem] tracking-[0.2em] uppercase hover:text-[var(--pale)] transition-colors"
              style={{ color: "rgba(168,230,216,0.4)" }}
            >
              Projects
            </Link>
            <span
              style={{ color: "rgba(168,230,216,0.2)", fontSize: "0.7rem" }}
            >
              ›
            </span>
            <span
              className="text-[0.62rem] tracking-[0.2em] uppercase"
              style={{ color: "var(--glow)" }}
            >
              Detail
            </span>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-[0.56rem] tracking-[0.22em] uppercase px-3 py-[5px] rounded-full"
              style={{
                background: "rgba(0,0,0,0.28)",
                color: statusColor(project.status),
                border: `1px solid ${statusColor(project.status)}55`,
              }}
            >
              {statusLabel(project.status)}
            </span>
            {project.isFeatured && (
              <span
                className="text-[0.54rem] tracking-[0.22em] uppercase px-3 py-[5px] rounded-[2px]"
                style={{
                  background: "rgba(201,168,76,0.18)",
                  color: "var(--gold-lt)",
                  border: "1px solid rgba(201,168,76,0.3)",
                }}
              >
                Featured
              </span>
            )}
          </div>

          <h1
            className="mb-5"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
              fontWeight: 700,
              color: "var(--cream)",
              lineHeight: 1.1,
              maxWidth: "760px",
            }}
          >
            {project.title}
          </h1>
        </div>
      </div>

      {/* ── Content + Sidebar ────────────────────────────────── */}
      <div className="section-wrap py-[68px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-[60px] items-start">
          {/* Article body */}
          <div>
            <article>{renderMarkdown(project.description)}</article>

            {/* ── Project Updates ─────────────────────────────── */}
            {project.updates.length > 0 && (
              <section className="mt-16">
                <div className="eyebrow mb-6">
                  <div className="ey-dash" />
                  <span className="ey-txt">Project Updates</span>
                </div>
                <div className="relative pl-5">
                  {/* Timeline line */}
                  <div
                    className="absolute left-0 top-2 bottom-2 w-px"
                    style={{
                      background:
                        "linear-gradient(to bottom, var(--emerald), transparent)",
                    }}
                  />

                  <div className="flex flex-col gap-8">
                    {project.updates.map((update) => (
                      <div key={update.id} className="relative">
                        {/* Dot */}
                        <div
                          className="absolute -left-[22px] top-[5px] w-[10px] h-[10px] rounded-full border-2 flex-shrink-0"
                          style={{
                            background: "var(--emerald)",
                            borderColor: "var(--cream)",
                            boxShadow: "0 0 0 2px var(--emerald)",
                          }}
                        />
                        <div
                          className="p-5 rounded-[12px]"
                          style={{
                            background: "var(--warm)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <div
                            className="mb-2 text-[0.6rem] tracking-[0.2em] uppercase"
                            style={{ color: "var(--mgrey)" }}
                          >
                            {formatDateShort(update.createdAt)}
                          </div>
                          <h4
                            className="mb-2"
                            style={{
                              fontFamily:
                                "var(--font-cormorant), Georgia, serif",
                              fontSize: "1.08rem",
                              fontWeight: 700,
                              color: "var(--deep)",
                            }}
                          >
                            {update.title}
                          </h4>
                          <p
                            style={{
                              fontFamily: "var(--font-lora), Georgia, serif",
                              fontSize: "0.85rem",
                              lineHeight: 1.82,
                              color: "var(--grey)",
                            }}
                          >
                            {update.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div
              className="mt-12 pt-8"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              <Link href="/projects" className="pcard-link">
                ← All Projects
              </Link>
            </div>
          </div>

          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-[90px]">
            {/* Funding card */}
            <div
              className="rounded-[16px] p-6"
              style={{
                background: "var(--warm)",
                border: "1px solid var(--border)",
              }}
            >
              <h4
                className="mb-4"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--deep)",
                }}
              >
                Funding Progress
              </h4>
              <div className="flex items-end justify-between mb-1">
                <span
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "var(--deep)",
                    lineHeight: 1,
                  }}
                >
                  {formatNaira(project.currentAmount)}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--mid)",
                    fontWeight: 600,
                  }}
                >
                  {pct}%
                </span>
              </div>
              <div
                className="mb-1"
                style={{ fontSize: "0.66rem", color: "var(--mgrey)" }}
              >
                raised of {formatNaira(project.goalAmount)} goal
              </div>
              <div
                className="w-full rounded-full h-[7px] mt-3 mb-5"
                style={{ background: "var(--warm2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background:
                      "linear-gradient(90deg, var(--emerald), var(--glow))",
                  }}
                />
              </div>
              <Link
                href={`/donate?project=${project.slug}`}
                className="block w-full text-center py-[13px] rounded-[7px] text-[0.7rem] font-semibold tracking-[0.18em] uppercase transition-all duration-200 hover:-translate-y-px hover:brightness-110"
                style={{ background: "var(--gold)", color: "var(--ink)" }}
              >
                Support This Project
              </Link>
            </div>

            {/* Details card */}
            <div
              className="rounded-[16px] p-6"
              style={{ background: "#fff", border: "1px solid var(--border)" }}
            >
              <h4
                className="mb-4"
                style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--deep)",
                }}
              >
                Project Details
              </h4>
              <dl className="flex flex-col gap-4">
                {[
                  { label: "Status", value: statusLabel(project.status) },
                  { label: "Created", value: formatDate(project.createdAt) },
                  {
                    label: "Last Updated",
                    value: formatDate(project.updatedAt),
                  },
                  {
                    label: "Updates",
                    value: `${project.updates.length} posted`,
                  },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col gap-[3px]">
                    <dt
                      style={{
                        fontSize: "0.58rem",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--mgrey)",
                      }}
                    >
                      {m.label}
                    </dt>
                    <dd
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 500,
                        color: "var(--deep)",
                        fontFamily: "var(--font-lora), Georgia, serif",
                      }}
                    >
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Project lead card */}
            <div
              className="rounded-[16px] p-6"
              style={{
                background: "var(--ink)",
                border: "1px solid rgba(168,230,216,0.07)",
              }}
            >
              <p
                className="mb-4 text-[0.58rem] tracking-[0.22em] uppercase"
                style={{ color: "rgba(168,230,216,0.4)" }}
              >
                Project Lead
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--deep), var(--emerald))",
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.1rem",
                  }}
                >
                  {init}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--pale)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.66rem",
                      color: "rgba(168,230,216,0.4)",
                      marginTop: 2,
                    }}
                  >
                    Eleje Legacy Staff
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── CTA Band ─────────────────────────────────────────── */}
      <section className="py-[72px]" style={{ background: "var(--deep)" }}>
        <div className="section-wrap text-center">
          <div className="eyebrow justify-center mb-4">
            <div className="ey-dash" />
            <span className="ey-txt" style={{ color: "rgba(168,230,216,0.5)" }}>
              Make a Difference
            </span>
            <div className="ey-dash" />
          </div>
          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--cream)",
              lineHeight: 1.15,
            }}
          >
            Every contribution builds a{" "}
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>
              legacy.
            </em>
          </h2>
          <p
            className="mb-8 mx-auto"
            style={{
              fontFamily: "var(--font-lora), Georgia, serif",
              fontSize: "0.95rem",
              lineHeight: 1.8,
              color: "rgba(168,230,216,0.55)",
              maxWidth: "480px",
            }}
          >
            Your donation directly funds projects like this one. 100% of gifts
            go to programme delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/donate"
              className="px-8 py-[14px] rounded-[4px] text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200 hover:-translate-y-px hover:brightness-110"
              style={{ background: "var(--gold)", color: "var(--ink)" }}
            >
              Donate Now
            </Link>
            <Link
              href="/projects"
              className="px-8 py-[14px] rounded-[4px] text-[0.7rem] font-semibold tracking-[0.2em] uppercase transition-all duration-200"
              style={{
                border: "1px solid rgba(168,230,216,0.22)",
                color: "var(--pale)",
              }}
            >
              See All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* <Footer minimal /> */}
    </>
  );
}
