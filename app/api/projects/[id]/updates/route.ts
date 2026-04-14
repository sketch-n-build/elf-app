import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles, canModify } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

/* ─────────────────────────────────────────────────────────────
   GET /api/projects/[id]/updates
   Public — returns all updates for a project.
───────────────────────────────────────────────────────────── */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await prisma.projectUpdate.findMany({
      where:   { projectId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: updates });
  } catch (err) {
    console.error("[GET /api/projects/:id/updates]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch project updates." }, { status: 500 });
  }
}

/* ─────────────────────────────────────────────────────────────
   POST /api/projects/[id]/updates
   Post a new narrative update for a project.
   Admin: any project.
   Staff: only their own project.
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
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
      return NextResponse.json(
        { success: false, error: "Forbidden: you can only post updates on your own projects." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content, image } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "title and content are required." },
        { status: 400 }
      );
    }

    const update = await prisma.projectUpdate.create({
      data: {
        projectId: id,
        title,
        content,
        image: image ?? null,
      },
    });

    return NextResponse.json({ success: true, data: update }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects/:id/updates]", err);
    return NextResponse.json({ success: false, error: "Failed to create project update." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/projects/[id]/updates
   Deletes ALL updates for a project (bulk clear).
   Admin: any project. Staff: own project only.
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, ["ADMIN", "STAFF"]);
  if (deny) return deny;

  try {
    const {id} = await ctx!.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    if (!canModify(req.user, project.createdById)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: you can only manage your own project updates." },
        { status: 403 }
      );
    }

    const { count } = await prisma.projectUpdate.deleteMany({
      where: { projectId: id },
    });

    return NextResponse.json({ success: true, message: `${count} update(s) deleted.` });
  } catch (err) {
    console.error("[DELETE /api/projects/:id/updates]", err);
    return NextResponse.json({ success: false, error: "Failed to delete project updates." }, { status: 500 });
  }
});