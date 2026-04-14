import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/projects/[id] — accepts id or slug
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findFirst({
      where: {
        OR:     [{ id }, { slug: id }],
        status: "ACTIVE", // public can only see active projects
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        updates:   { orderBy: { createdAt: "desc" } },
        _count:    { select: { donations: true } },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (err) {
    console.error("[GET /api/public/projects/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch project." }, { status: 500 });
  }
}