import Link from "next/link";
// import Footer from "@/components/Footer";
// import PageBanner from "@/components/ui/PageBanner";
// import ProjectGrid from "@/components/projects/ProjectGrid";
// import { Project } from "@/types/project";
import {
  progressPercent,
  formatNaira,
  statusLabel,
  statusColor,
  fullName,
  initials,
  excerpt,
} from "@/lib/project-utils";
import ProjectGrid from "../components/projects/ProjectGrid";
import { Project } from "@/lib/types/Project";
import PageBanner from "../components/PageBanner";

/* ─── Mock data — replace with Prisma query ──────────────────────────────
   const projects = await prisma.project.findMany({
     orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
     include: {
       createdBy: {
         select: { id: true, firstName: true, lastName: true, email: true,
                   profile: { select: { avatarUrl: true } } },
       },
       updates: { orderBy: { createdAt: "desc" }, take: 1 },
     },
   });
──────────────────────────────────────────────────────────────────────── */
const mockProjects: Project[] = [
  {
    id: "p1",
    title: "Mother & Child Wellness Outreach",
    slug: "mother-child-wellness-outreach",
    description: `## Overview\n\nMonthly home visits delivering maternal health education, postnatal support, and child nutrition guidance to over 400 families across Ebonyi South.\n\nSince launching in 2024, we have reached 412 families and seen a 34% reduction in childhood malnutrition in our target communities.`,
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
        id: "upd1",
        projectId: "p1",
        title: "Q1 2026 Progress",
        content: "412 families reached this quarter.",
        image: null,
        createdAt: "2026-02-01T00:00:00Z",
      },
    ],
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "p2",
    title: "Legacy Learning Scholarship Programme",
    slug: "legacy-learning-scholarship",
    description: `## Overview\n\nProviding primary and secondary school scholarships, learning materials, and mentorship to children from low-income households in Ebonyi State.\n\n340 scholarships awarded in year one with a 97% retention rate.`,
    coverImage: null,
    goalAmount: 18000000,
    currentAmount: 11200000,
    status: "ACTIVE",
    isFeatured: true,
    createdById: "u2",
    createdBy: {
      id: "u2",
      firstName: "Chidi",
      lastName: "Ezenwachi",
      email: "chidi@eleje.ng",
    },
    updates: [],
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: "2026-01-15T00:00:00Z",
  },
  {
    id: "p3",
    title: "Women in Growth: Vocational Skills Training",
    slug: "women-in-growth-vocational-training",
    description: `## Overview\n\nA 12-week intensive vocational training programme equipping women with skills in tailoring, food processing, and small business management.\n\n86 graduates in cohort one, with 74% now generating independent income.`,
    coverImage: null,
    goalAmount: 7500000,
    currentAmount: 5100000,
    status: "ACTIVE",
    isFeatured: false,
    createdById: "u3",
    createdBy: {
      id: "u3",
      firstName: "Ngozi",
      lastName: "Umezurike",
      email: "ngozi@eleje.ng",
    },
    updates: [],
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2026-01-10T00:00:00Z",
  },
  {
    id: "p4",
    title: "Early Childhood Development Centres",
    slug: "early-childhood-development-centres",
    description: `## Overview\n\nEstablishing and equipping six ECD centres in underserved communities, staffed by trained local educators and health workers.\n\nThe first 1,000 days of a child's life determine lifelong outcomes.`,
    coverImage: null,
    goalAmount: 22000000,
    currentAmount: 9800000,
    status: "ACTIVE",
    isFeatured: false,
    createdById: "u2",
    createdBy: {
      id: "u2",
      firstName: "Chidi",
      lastName: "Ezenwachi",
      email: "chidi@eleje.ng",
    },
    updates: [],
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2026-02-10T00:00:00Z",
  },
  {
    id: "p5",
    title: "Community Health Worker Training",
    slug: "community-health-worker-training",
    description: `## Overview\n\nTraining and deploying 60 community health workers drawn from target communities to serve as the first point of contact for maternal and child health needs across Ebonyi, Ogbaru, and Ekwusigo.`,
    coverImage: null,
    goalAmount: 5000000,
    currentAmount: 5000000,
    status: "COMPLETED",
    isFeatured: false,
    createdById: "u1",
    createdBy: {
      id: "u1",
      firstName: "Amara",
      lastName: "Okonkwo",
      email: "amara@eleje.ng",
    },
    updates: [
      {
        id: "upd2",
        projectId: "p5",
        title: "Programme Complete",
        content: "All 60 CHWs certified and deployed.",
        image: null,
        createdAt: "2025-07-01T00:00:00Z",
      },
    ],
    createdAt: "2024-07-01T00:00:00Z",
    updatedAt: "2025-07-01T00:00:00Z",
  },
  {
    id: "p6",
    title: "Antenatal Nutrition Support Initiative",
    slug: "antenatal-nutrition-support",
    description: `## Overview\n\nDistributing monthly nutrition packs (iron, folic acid, protein supplements) to pregnant women in our programme areas, combined with bi-weekly group education sessions on maternal diet and newborn care.`,
    coverImage: null,
    goalAmount: 4500000,
    currentAmount: 980000,
    status: "PAUSED",
    isFeatured: false,
    createdById: "u4",
    createdBy: {
      id: "u4",
      firstName: "Ifeanyi",
      lastName: "Agu",
      email: "ifeanyi@eleje.ng",
    },
    updates: [],
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2025-11-01T00:00:00Z",
  },
];

export default function ProjectsPage() {
  const featured = mockProjects.filter((p) => p.isFeatured);
  const rest = mockProjects.filter((p) => !p.isFeatured);
  const totalRaised = mockProjects.reduce((sum, p) => sum + p.currentAmount, 0);
  const activeCount = mockProjects.filter((p) => p.status === "ACTIVE").length;
  const highlightProj = featured[0]; // Use first featured for the big card

  return (
    <>
      <PageBanner
        label="Our Projects"
        title={
          <>
            Change that you can{" "}
            <em style={{ fontStyle: "italic", color: "var(--glow)" }}>
              see and measure.
            </em>
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
              { n: `${mockProjects.length}`, l: "Total Projects" },
              { n: `${activeCount}`, l: "Active Now" },
              { n: formatNaira(totalRaised), l: "Total Raised" },
              { n: `${featured.length}`, l: "Featured" },
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
        {/* Featured project — big 2-col card */}
        {highlightProj && (
          <div className="mb-14">
            <div className="eyebrow mb-5">
              <div className="ey-dash" />
              <span className="ey-txt">Featured Project</span>
            </div>
            <Link href={`/project/${highlightProj.slug}`}>
              <div
                className="group grid grid-cols-1 lg:grid-cols-[1fr_1fr] rounded-[20px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                style={{
                  background: "#fff",
                  border: "1px solid var(--border)",
                  boxShadow: "0 8px 36px var(--shadow)",
                }}
              >
                {/* Visual panel */}
                <div
                  className="min-h-[260px] lg:min-h-[380px] relative overflow-hidden flex flex-col items-start justify-between p-8"
                  style={{
                    background:
                      "linear-gradient(140deg, var(--deep) 0%, var(--emerald) 60%, #34D399 100%)",
                  }}
                >
                  <div
                    className="absolute top-8 right-8 w-36 h-36 rounded-full opacity-10"
                    style={{ border: "1px solid var(--pale)" }}
                  />
                  <div
                    className="absolute top-16 right-16 w-20 h-20 rounded-full opacity-10"
                    style={{ border: "1px solid var(--glow)" }}
                  />
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

                  <div className="flex items-center gap-3 relative z-10">
                    <span
                      className="text-[0.56rem] tracking-[0.28em] uppercase px-3 py-[5px] rounded-[2px]"
                      style={{
                        background: "rgba(255,255,255,0.14)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      Featured
                    </span>
                    <span
                      className="text-[0.54rem] tracking-[0.22em] uppercase px-[10px] py-[4px] rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.28)",
                        color: statusColor(highlightProj.status),
                        border: `1px solid ${statusColor(highlightProj.status)}55`,
                      }}
                    >
                      {statusLabel(highlightProj.status)}
                    </span>
                  </div>

                  {/* Latest update badge */}
                  {highlightProj.updates[0] && (
                    <div
                      className="relative z-10 flex items-center gap-2 px-3 py-2 rounded-[6px]"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <span
                        className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                        style={{ background: "var(--glow)" }}
                      />
                      <span
                        className="text-[0.58rem] tracking-wide"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        Latest: {highlightProj.updates[0].title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content panel */}
                <div className="p-8 lg:p-10 flex flex-col justify-center">
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
                    {highlightProj.title}
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
                    {excerpt(highlightProj.description, 180)}
                  </p>

                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span
                        style={{ fontSize: "0.75rem", color: "var(--grey)" }}
                      >
                        {formatNaira(highlightProj.currentAmount)} raised
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--mid)",
                          fontWeight: 600,
                        }}
                      >
                        {progressPercent(
                          highlightProj.currentAmount,
                          highlightProj.goalAmount,
                        )}
                        % of goal
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-[6px]"
                      style={{ background: "var(--warm2)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${progressPercent(highlightProj.currentAmount, highlightProj.goalAmount)}%`,
                          background:
                            "linear-gradient(90deg, var(--emerald), var(--glow))",
                        }}
                      />
                    </div>
                    <div
                      className="mt-1"
                      style={{ fontSize: "0.62rem", color: "var(--mgrey)" }}
                    >
                      of {formatNaira(highlightProj.goalAmount)} target
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--deep), var(--emerald))",
                          fontFamily: "var(--font-cormorant), Georgia, serif",
                          fontSize: "1rem",
                        }}
                      >
                        {initials(highlightProj.createdBy)}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 500,
                            color: "var(--deep)",
                          }}
                        >
                          {fullName(highlightProj.createdBy)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.66rem",
                            color: "var(--mgrey)",
                            marginTop: 1,
                          }}
                        >
                          Project Lead
                        </div>
                      </div>
                    </div>
                    <span className="pcard-link">View Project →</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* All projects grid */}
        <div className="eyebrow mb-8">
          <div className="ey-dash" />
          <span className="ey-txt">All Projects</span>
        </div>

        <ProjectGrid projects={rest} />
      </div>

      {/* <Footer /> */}
    </>
  );
}
