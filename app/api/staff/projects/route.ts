import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { Prisma, UserRole } from "@prisma/client";

// GET /api/staff/projects
// Returns ALL projects (all statuses) scoped to this staff member.
// Admin sees all projects across all staff.
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const skip   = (page - 1) * limit;

    // Staff only sees their own projects; admin sees all
    const ownerFilter = req.user.role === UserRole.STAFF
      ? { createdById: req.user.sub }
      : {};

    const where: Prisma.ProjectWhereInput = {
      ...ownerFilter,
      ...(status && { status: status as any }),
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
          createdBy:     { select: { firstName: true, lastName: true, email: true } },
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
    console.error("[GET /api/staff/projects]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch projects." }, { status: 500 });
  }
});

// POST /api/staff/projects — create a new project
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { title, description, goalAmount, coverImage, status = "ACTIVE", isFeatured = false } =
      await req.json();

    if (!title || !description || !goalAmount) {
      return NextResponse.json(
        { success: false, error: "title, description, and goalAmount are required." },
        { status: 400 }
      );
    }

    let slug = slugify(title);
    const conflict = await prisma.project.findUnique({ where: { slug } });
    if (conflict) slug = uniqueSlug(title);

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        goalAmount:  new Prisma.Decimal(goalAmount),
        coverImage:  coverImage ?? null,
        status,
        isFeatured,
        createdById: req.user.sub,
      },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/staff/projects]", err);
    return NextResponse.json({ success: false, error: "Failed to create project." }, { status: 500 });
  }
});