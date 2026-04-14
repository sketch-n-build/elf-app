import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { Prisma, UserRole } from "@prisma/client";
import { canModify, requireRoles } from "@/lib/roleGuards";

/* ─────────────────────────────────────────────────────────────
   GET /api/investments/[id]
   ADMIN/STAFF → any investment.
   INVESTOR    → only their own investment.
───────────────────────────────────────────────────────────── */
export const GET = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF, UserRole.INVESTOR]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;  
    const investment = await prisma.investment.findUnique({
      where:   { id },
      include: {
        project: { select: { id: true, title: true, slug: true } },
        user:    { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!investment) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }

    // Investors can only view their own
    if (req.user.role === "INVESTOR" && investment.userId !== req.user.sub) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: investment });
  } catch (err) {
    console.error("[GET /api/investments/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch investment." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   PATCH /api/investments/[id]
   Admin can correct investment amounts (e.g. data-entry error).
   Investors cannot edit their own investments after creation.
   Access: ADMIN only
───────────────────────────────────────────────────────────── */
export const PATCH = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, ["ADMIN"]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;  
    const investment = await prisma.investment.findUnique({ where: { id } });
    if (!investment) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }

    const body = await req.json();
    const { amount, projectId } = body;

    const updated = await prisma.investment.update({
      where: { id },
      data: {
        ...(amount    && { amount: new Prisma.Decimal(amount) }),
        ...(projectId && { projectId }),
      },
      include: {
        project: { select: { id: true, title: true } },
        user:    { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("[PATCH /api/investments/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to update investment." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/investments/[id]
   Admin: delete any investment.
   Investor: delete their own (e.g. cancellation before processing).
   Access: ADMIN, INVESTOR
───────────────────────────────────────────────────────────── */
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.INVESTOR]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;  
    const investment = await prisma.investment.findUnique({ where: { id } });
    if (!investment) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }

    if (!canModify(req.user, investment.userId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden: you can only delete your own investments." },
        { status: 403 }
      );
    }

    await prisma.investment.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Investment deleted." });
  } catch (err) {
    console.error("[DELETE /api/investments/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete investment." }, { status: 500 });
  }
});