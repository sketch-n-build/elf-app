import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles, canModify } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

// GET /api/staff/projects/[id]/updates
export const GET = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { id } = await ctx!.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    const updates = await prisma.projectUpdate.findMany({
      where:   { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: updates });
  } catch (err) {
    console.error("[GET /api/staff/projects/:id/updates]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch updates." }, { status: 500 });
  }
});

// POST /api/staff/projects/[id]/updates
export const POST = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { id } = await ctx!.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    if (!canModify(req.user, project.createdById)) {
      return NextResponse.json({ success: false, error: "Forbidden: you can only post updates on your own projects." }, { status: 403 });
    }

    const { title, content, image } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ success: false, error: "title and content are required." }, { status: 400 });
    }

    const update = await prisma.projectUpdate.create({
      data: { projectId: id, title, content, image: image ?? null },
    });

    return NextResponse.json({ success: true, data: update }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/staff/projects/:id/updates]", err);
    return NextResponse.json({ success: false, error: "Failed to create update." }, { status: 500 });
  }
});