import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles, canModify } from "@/lib/roleGuards";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { UserRole } from "@prisma/client";

// GET /api/staff/blogs/[id]
export const GET = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { id } = await ctx!.params;
    const blog = await prisma.blog.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
    });

    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }

    // Staff can only view their own blogs
    if (req.user.role === UserRole.STAFF && blog.authorId !== req.user.sub) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (err) {
    console.error("[GET /api/staff/blogs/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch blog post." }, { status: 500 });
  }
});

// PATCH /api/staff/blogs/[id]
export const PATCH = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const {id} = await ctx!.params;
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }

    if (!canModify(req.user, blog.authorId)) {
      return NextResponse.json({ success: false, error: "Forbidden: you can only edit your own posts." }, { status: 403 });
    }

    const { title, content, excerpt, coverImage, isPublished } = await req.json();

    let slug = blog.slug;
    if (title && title !== blog.title) {
      const candidate = slugify(title);
      const conflict  = await prisma.blog.findFirst({ where: { slug: candidate, NOT: { id: blog.id } } });
      slug = conflict ? uniqueSlug(title) : candidate;
    }

    let publishedAt = blog.publishedAt;
    if (isPublished === true  && !blog.isPublished) publishedAt = new Date();
    if (isPublished === false)                       publishedAt = null;

    const updated = await prisma.blog.update({
      where: { id },
      data: {
        ...(title      && { title, slug }),
        ...(content    && { content }),
        ...(excerpt    !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(isPublished !== undefined && { isPublished, publishedAt }),
      },
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PATCH /api/staff/blogs/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to update blog post." }, { status: 500 });
  }
});

// DELETE /api/staff/blogs/[id]
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { id } = await ctx!.params;
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }

    if (!canModify(req.user, blog.authorId)) {
      return NextResponse.json({ success: false, error: "Forbidden: you can only delete your own posts." }, { status: 403 });
    }

    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Blog post deleted." });
  } catch (err) {
    console.error("[DELETE /api/staff/blogs/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete blog post." }, { status: 500 });
  }
});