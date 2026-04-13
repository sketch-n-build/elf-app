import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/blogs — returns only published posts, no auth
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 10)));
    const search = searchParams.get("search") ?? undefined;
    const skip   = (page - 1) * limit;

    const where = {
      isPublished: true,
      ...(search && {
        OR: [
          { title:   { contains: search, mode: "insensitive" as const } },
          { excerpt: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        select: {
          id:          true,
          title:       true,
          slug:        true,
          excerpt:     true,
          coverImage:  true,
          isPublished: true,
          publishedAt: true,
          createdAt:   true,
          author:      { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: blogs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/public/blogs]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs." }, { status: 500 });
  }
}