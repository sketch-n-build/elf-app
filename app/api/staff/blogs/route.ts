import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { UserRole } from "@prisma/client";

// GET /api/staff/blogs
// Staff sees only their own (published + drafts).
// Admin sees all.
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 100)));
    const search = searchParams.get("search") ?? undefined;
    const skip   = (page - 1) * limit;

    // Staff scoped to own blogs; admin sees all
    const ownerFilter = req.user.role === UserRole.STAFF
      ? { authorId: req.user.sub }
      : {};

    const where = {
      ...ownerFilter,
      // No isPublished filter — staff sees both published and drafts
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
        orderBy: { createdAt: "desc" },
        select: {
          id:          true,
          title:       true,
          slug:        true,
          excerpt:     true,
          content:     true,
          coverImage:  true,
          isPublished: true,
          publishedAt: true,
          createdAt:   true,
          updatedAt:   true,
          author:      { select: { firstName: true, lastName: true, email: true } },
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
    console.error("[GET /api/staff/blogs]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs." }, { status: 500 });
  }
});

// POST /api/staff/blogs
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { title, content, excerpt, coverImage, isPublished = false } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "title and content are required." }, { status: 400 });
    }

    let slug = slugify(title);
    const conflict = await prisma.blog.findUnique({ where: { slug } });
    if (conflict) slug = uniqueSlug(title);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt:     excerpt     ?? null,
        coverImage:  coverImage  ?? null,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        authorId:    req.user.sub,
      },
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/staff/blogs]", err);
    return NextResponse.json({ success: false, error: "Failed to create blog post." }, { status: 500 });
  }
});