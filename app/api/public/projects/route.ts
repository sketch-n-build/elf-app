import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// GET /api/public/projects
// Returns only ACTIVE projects. No token required.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 12)));
    const featured = searchParams.get("featured");
    const search   = searchParams.get("search") ?? undefined;
    const skip     = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      status: "ACTIVE",
      ...(featured === "true" && { isFeatured: true }),
      ...(search && {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        select: {
          id:            true,
          title:         true,
          slug:          true,
          description:   true,
          coverImage:    true,
          goalAmount:    true,
          currentAmount: true,
          status:        true,
          isFeatured:    true,
          createdAt:     true,
          createdBy:     { select: { firstName: true, lastName: true } },
          _count:        { select: { donations: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: projects,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/public/projects]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch projects." }, { status: 500 });
  }
}