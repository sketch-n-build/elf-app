import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { Prisma, UserRole } from "@prisma/client";

// GET /api/investor/investments — this investor's own investments only
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.INVESTOR]);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(req.url);
    const page      = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit     = Math.min(200, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const projectId = searchParams.get("projectId") ?? undefined;
    const skip      = (page - 1) * limit;

    const where: Prisma.InvestmentWhereInput = {
      userId: req.user.sub, // always scoped to this investor
      ...(projectId && { projectId }),
    };

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            select: { id: true, title: true, slug: true, status: true, goalAmount: true, currentAmount: true },
          },
        },
      }),
      prisma.investment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: investments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/investor/investments]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch investments." }, { status: 500 });
  }
});

// POST /api/investor/investments — create a new investment
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.INVESTOR]);
  if (deny) return deny;

  try {
    const { projectId, amount } = await req.json();

    if (!projectId || !amount) {
      return NextResponse.json({ success: false, error: "projectId and amount are required." }, { status: 400 });
    }

    if (Number(amount) <= 0) {
      return NextResponse.json({ success: false, error: "amount must be a positive number." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }
    if (project.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Investments can only be made on active projects." }, { status: 422 });
    }

    const investment = await prisma.investment.create({
      data: { userId: req.user.sub, projectId, amount: new Prisma.Decimal(amount) },
      include: { project: { select: { id: true, title: true, slug: true } } },
    });

    return NextResponse.json({ success: true, data: investment }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/investor/investments]", err);
    return NextResponse.json({ success: false, error: "Failed to create investment." }, { status: 500 });
  }
});