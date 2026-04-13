import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/public/blogs/[id] — accepts id or slug, only published
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blog = await prisma.blog.findFirst({
      where: {
        OR:          [{ id }, { slug: id }],
        isPublished: true,
      },
      include: { author: { select: { firstName: true, lastName: true } } },
    });

    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog post not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (err) {
    console.error("[GET /api/public/blogs/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch blog post." }, { status: 500 });
  }
}