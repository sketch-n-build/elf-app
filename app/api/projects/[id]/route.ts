import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles, canModify } from "@/lib/roleGuards";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { Prisma, UserRole } from "@prisma/client";

/* ─────────────────────────────────────────────────────────────
   GET /api/projects/[id]
   Public — accepts id OR slug.
───────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        updates:   { orderBy: { createdAt: "desc" } },
        _count:    { select: { donations: true, investments: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error("[GET /api/projects/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch project." }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────────────────────
   PATCH /api/projects/[id]
   Admin: edit any project.
   Staff: edit only their own project.
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const PATCH = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    // const project = await prisma.project.findUnique({ where: { id: ctx?.params.id } });
    const { id } = await ctx?.params || { id: "" };

    const project = await prisma.project.findUnique({ 
      where: { id } 
    });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    if (!canModify(req.user, project.createdById)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: you can only edit your own projects." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, goalAmount, coverImage, status, isFeatured } = body;

    // Re-slug only if title changed and new slug isn't already taken by a different project
    let slug = project.slug;
    if (title && title !== project.title) {
      const candidate = slugify(title);
      const conflict  = await prisma.project.findFirst({
        where: { slug: candidate, NOT: { id: project.id } },
      });
      slug = conflict ? uniqueSlug(title) : candidate;
    }
    
    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(title       && { title, slug }),
        ...(description && { description }),
        ...(goalAmount  && { goalAmount: new Prisma.Decimal(goalAmount) }),
        ...(coverImage  !== undefined && { coverImage }),
        ...(status      && { status }),
        ...(isFeatured  !== undefined && { isFeatured }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PATCH /api/projects/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to update project." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/projects/[id]
   Admin: delete any project.
   Staff: delete only their own project.
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { id } = await ctx?.params || { id: "" };
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    if (!canModify(req.user, project.createdById)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: you can only delete your own projects." },
        { status: 403 }
      );
    }

    // Cascade-delete related records manually (Prisma doesn't cascade by default here)
    await prisma.$transaction([
      prisma.projectUpdate.deleteMany({ where: { projectId: id } }),
      prisma.investment.deleteMany({   where: { projectId: id } }),
      prisma.project.delete({          where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Project deleted." });
  } catch (err) {
    console.error("[DELETE /api/projects/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete project." }, { status: 500 });
  }
});