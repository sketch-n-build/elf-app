import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/donors
// Paginated list of donors with their donation history.
// Access: ADMIN, STAFF
// ─────────────────────────────────────────────────────────────────────────────
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(req.url);
    const page        = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit       = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const search      = searchParams.get("search") ?? undefined;
    const isAnonymous = searchParams.get("anonymous");
    const skip        = (page - 1) * limit;

    const where = {
      ...(isAnonymous === "true"  && { isAnonymous: true  }),
      ...(isAnonymous === "false" && { isAnonymous: false }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email:    { contains: search, mode: "insensitive" as const } },
          { phone:    { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { donations: true } },
          donations: {
            where:   { paystackStatus: "SUCCESS" },
            select:  { amount: true },
          },
        },
      }),
      prisma.donor.count({ where }),
    ]);

    const enriched = donors.map(({ donations, ...d }) => ({
      ...d,
      totalDonatedNaira: donations.reduce((sum, don) => sum + Number(don.amount), 0),
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/donors]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch donors." }, { status: 500 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/donors
// Manually register a donor (e.g. for offline / bank transfer donations).
// Access: ADMIN, STAFF
// ─────────────────────────────────────────────────────────────────────────────
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const body = await req.json();
    const { email, fullName, phone, isAnonymous = false } = body;

    if (!isAnonymous && !email && !fullName) {
      return NextResponse.json(
        { success: false, error: "Provide at least an email or fullName for a non-anonymous donor." },
        { status: 400 }
      );
    }

    // Prevent duplicate email donors (after schema patch adds @unique)
    if (email) {
      const existing = await prisma.donor.findFirst({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "A donor with this email already exists.", data: existing },
          { status: 409 }
        );
      }
    }

    const donor = await prisma.donor.create({
      data: {
        email:      email    ?? null,
        fullName:   fullName ?? null,
        phone:      phone    ?? null,
        isAnonymous,
      },
    });

    return NextResponse.json({ success: true, data: donor }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A donor with this email already exists." },
        { status: 409 }
      );
    }
    console.error("[POST /api/donors]", err);
    return NextResponse.json({ success: false, error: "Failed to create donor." }, { status: 500 });
  }
});