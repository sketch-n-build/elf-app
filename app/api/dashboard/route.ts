import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dashboard
//
// Returns aggregated stats for the admin/staff dashboard.
// ADMIN  → organisation-wide totals.
// STAFF  → totals scoped to their own content.
//
// All numbers are computed in a single parallel batch to keep latency low.
// ─────────────────────────────────────────────────────────────────────────────
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  const isAdmin = req.user.role === UserRole.ADMIN;
  const userId  = req.user.sub;

  try {
    // ── Donations ──────────────────────────────────────────────────────────
    const donationWhere = {}; // Admins see all; donations have no staff-owner concept

    // ── Projects ───────────────────────────────────────────────────────────
    const projectWhere = isAdmin ? {} : { createdById: userId };

    // ── Blogs ──────────────────────────────────────────────────────────────
    const blogWhere = isAdmin ? {} : { authorId: userId };

    // ── 30-day window ──────────────────────────────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      // Donation totals
      totalDonationsResult,
      successfulDonationsResult,
      pendingDonationsResult,
      recentDonationsResult,
      donationsByDay,

      // Project stats
      totalProjects,
      activeProjects,
      completedProjects,
      featuredProjects,
      topProjects,

      // Blog stats
      totalBlogs,
      publishedBlogs,
      draftBlogs,

      // Campaign stats
      totalCampaigns,
      activeCampaigns,
      campaignFunds,

      // Investment stats (admin only)
      totalInvestments,
      investmentTotal,

      // User stats (admin only)
      totalUsers,
      usersByRole,

      // Recent activity
      recentDonations,
      recentBlogs,
    ] = await Promise.all([
      // ── Donations ────────────────────────────────────────────────────────
      prisma.donation.aggregate({
        where:  { ...donationWhere, paystackStatus: "SUCCESS" },
        _sum:   { amount: true },
        _count: true,
      }),
      prisma.donation.count({ where: { paystackStatus: "SUCCESS" } }),
      prisma.donation.count({ where: { paystackStatus: "PENDING" } }),
      prisma.donation.aggregate({
        where: { paystackStatus: "SUCCESS", paidAt: { gte: thirtyDaysAgo } },
        _sum:  { amount: true },
        _count: true,
      }),

      // Donations grouped by day for the last 30 days (for sparkline charts)
      prisma.$queryRaw<{ day: Date; total: number; count: number }[]>`
        SELECT
          DATE_TRUNC('day', "paidAt") AS day,
          SUM(amount)::float           AS total,
          COUNT(*)::int                AS count
        FROM "Donation"
        WHERE "paystackStatus" = 'SUCCESS'
          AND "paidAt" >= ${thirtyDaysAgo}
        GROUP BY DATE_TRUNC('day', "paidAt")
        ORDER BY day ASC
      `,

      // ── Projects ─────────────────────────────────────────────────────────
      prisma.project.count({ where: projectWhere }),
      prisma.project.count({ where: { ...projectWhere, status: "ACTIVE" } }),
      prisma.project.count({ where: { ...projectWhere, status: "COMPLETED" } }),
      prisma.project.count({ where: { ...projectWhere, isFeatured: true } }),

      // Top 5 projects by funds raised
      prisma.project.findMany({
        where:   projectWhere,
        orderBy: { currentAmount: "desc" },
        take:    5,
        select: {
          id:            true,
          title:         true,
          slug:          true,
          goalAmount:    true,
          currentAmount: true,
          status:        true,
          _count:        { select: { donations: true } },
        },
      }),

      // ── Blogs ─────────────────────────────────────────────────────────────
      prisma.blog.count({ where: blogWhere }),
      prisma.blog.count({ where: { ...blogWhere, isPublished: true } }),
      prisma.blog.count({ where: { ...blogWhere, isPublished: false } }),

      // ── Campaigns ─────────────────────────────────────────────────────────
      prisma.campaign.count(),
      prisma.campaign.count({ where: { isActive: true } }),
      prisma.donation.aggregate({
        where: { paystackStatus: "SUCCESS", campaignId: { not: null } },
        _sum:  { amount: true },
      }),

      // ── Investments (admin only — expensive for staff) ────────────────────
      isAdmin
        ? prisma.investment.count()
        : Promise.resolve(0),
      isAdmin
        ? prisma.investment.aggregate({ _sum: { amount: true } })
        : Promise.resolve({ _sum: { amount: null } }),

      // ── Users (admin only) ────────────────────────────────────────────────
      isAdmin ? prisma.user.count() : Promise.resolve(0),
      isAdmin
        ? prisma.user.groupBy({
            by:      ["role"],
            _count:  { _all: true },
          })
        : Promise.resolve([]),

      // ── Recent activity feed ──────────────────────────────────────────────
      prisma.donation.findMany({
        where:   { paystackStatus: "SUCCESS" },
        orderBy: { paidAt: "desc" },
        take:    8,
        select: {
          id:     true,
          amount: true,
          paidAt: true,
          donor:  { select: { fullName: true, isAnonymous: true } },
          project:{ select: { title: true, slug: true } },
        },
      }),
      prisma.blog.findMany({
        where:   { ...blogWhere, isPublished: true },
        orderBy: { publishedAt: "desc" },
        take:    5,
        select: {
          id:          true,
          title:       true,
          slug:        true,
          publishedAt: true,
          author:      { select: { firstName: true, lastName: true } },
        },
      }),
    ]);

    // ── Shape the response ─────────────────────────────────────────────────
    const stats = {
      donations: {
        total:              totalDonationsResult._count,
        totalRaisedNaira:   Number(totalDonationsResult._sum.amount ?? 0),
        successful:         successfulDonationsResult,
        pending:            pendingDonationsResult,
        last30Days: {
          count:       recentDonationsResult._count,
          raisedNaira: Number(recentDonationsResult._sum.amount ?? 0),
        },
        dailyBreakdown: donationsByDay.map((row) => ({
          day:   row.day,
          total: Number(row.total),
          count: Number(row.count),
        })),
      },

      projects: {
        total:     totalProjects,
        active:    activeProjects,
        completed: completedProjects,
        featured:  featuredProjects,
        top5:      topProjects.map((p) => ({
          ...p,
          goalAmount:    Number(p.goalAmount),
          currentAmount: Number(p.currentAmount),
          progressPct:   p.goalAmount.gt(0)
            ? Math.min(100, Number(p.currentAmount.div(p.goalAmount).times(100).toFixed(1)))
            : 0,
        })),
      },

      blogs: {
        total:     totalBlogs,
        published: publishedBlogs,
        drafts:    draftBlogs,
      },

      campaigns: {
        total:          totalCampaigns,
        active:         activeCampaigns,
        totalRaisedNaira: Number(campaignFunds._sum.amount ?? 0),
      },

      ...(isAdmin && {
        investments: {
          total:         totalInvestments as number,
          totalNaira:    Number((investmentTotal as any)._sum.amount ?? 0),
        },
        users: {
          total: totalUsers as number,
          byRole: (usersByRole as any[]).reduce(
            (acc: Record<string, number>, row: any) => {
              acc[row.role] = row._count._all;
              return acc;
            },
            {}
          ),
        },
      }),

      recentActivity: {
        donations: recentDonations.map((d) => ({
          id:          d.id,
          amount:      Number(d.amount),
          paidAt:      d.paidAt,
          donorName:   d.donor?.isAnonymous ? "Anonymous" : (d.donor?.fullName ?? "Unknown"),
          projectTitle: d.project?.title ?? null,
          projectSlug:  d.project?.slug  ?? null,
        })),
        blogs: recentBlogs,
      },
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json({ success: false, error: "Failed to load dashboard stats." }, { status: 500 });
  }
});