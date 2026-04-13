import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { Prisma, UserRole } from "@prisma/client";

/* ─────────────────────────────────────────────────────────────
   GET /api/projects
   Public route — no auth needed.
   Query params: page, limit, status, featured, search
   When called by ADMIN/STAFF with a Bearer token, returns all
   projects including non-ACTIVE ones.
───────────────────────────────────────────────────────────── */
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF, UserRole.INVESTOR]);
  if (deny) return deny;
  try {
    const { searchParams } = new URL(req.url);
    const page     = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit    = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 12)));
    const status   = searchParams.get("status") ?? undefined;
    const featured = searchParams.get("featured");
    const search   = searchParams.get("search") ?? undefined;
    const skip     = (page - 1) * limit;

    // Check for an authenticated staff/admin user (optional auth)
    let isPrivileged = false;
    const auth = req.headers.get("authorization");
    if (auth) {
      try {
        const jwt   = await import("jsonwebtoken");
        const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : auth;
        const p     = jwt.default.verify(token, process.env.JWT_SECRET!) as any;
        isPrivileged = p?.role === UserRole.ADMIN || p?.role === UserRole.STAFF;
      } catch { /* ignore bad tokens on public route */ }
    }

    const where: Prisma.ProjectWhereInput = {
      // Public consumers only see ACTIVE projects unless privileged
      ...(!isPrivileged && { status: "ACTIVE" }),
      ...(status   && isPrivileged && { status: status as any }),
      ...(featured === "true"      && { isFeatured: true }),
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
    console.error("[GET /api/projects]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch projects." }, { status: 500 });
  }
})

/* ─────────────────────────────────────────────────────────────
   POST /api/projects
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const body = await req.json();
    const {
      title,
      description,
      goalAmount,
      coverImage,
      status     = "ACTIVE",
      isFeatured = false,
    } = body;

    if (!title || !description || !goalAmount) {
      return NextResponse.json(
        { success: false, error: "title, description, and goalAmount are required." },
        { status: 400 }
      );
    }

    // Guarantee unique slug
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
    console.error("[POST /api/projects]", err);
    return NextResponse.json({ success: false, error: "Failed to create project." }, { status: 500 });
  }
});