import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { Prisma, UserRole } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

/* ─────────────────────────────────────────────────────────────
   GET /api/donations/[id]
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const GET = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        donor:    true,
        project:  { select: { id: true, title: true, slug: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    if (!donation) {
      return NextResponse.json({ success: false, error: "Donation not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: donation });
  } catch (err) {
    console.error("[GET /api/donations/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch donation." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   PATCH /api/donations/[id]
   Admin can update status, amount, references.
   Staff cannot change donation records — audit safety.
   Access: ADMIN only
───────────────────────────────────────────────────────────── */
export const PATCH = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;  
    const body = await req.json();
    const {
      amount,
      currency,
      paystackReference,
      paystackStatus,
      paidAt,
      projectId,
      campaignId,
    } = body;

    const existing = await prisma.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Donation not found." }, { status: 404 });
    }

    // If status is changing to SUCCESS and wasn't before, increment project amount
    const becomingSuccess =
      paystackStatus === "SUCCESS" && existing.paystackStatus !== "SUCCESS";

    const donation = await prisma.donation.update({
      where: { id },
      data: {
        ...(amount            && { amount: new Prisma.Decimal(amount) }),
        ...(currency          && { currency }),
        ...(paystackReference && { paystackReference }),
        ...(paystackStatus    && { paystackStatus }),
        ...(paidAt            && { paidAt: new Date(paidAt) }),
        ...(projectId         && { projectId }),
        ...(campaignId        && { campaignId }),
      },
    });

    if (becomingSuccess && donation.projectId) {
      await prisma.project.update({
        where: { id: donation.projectId },
        data:  { currentAmount: { increment: donation.amount } },
      });
    }

    return NextResponse.json({ success: true, data: donation });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "paystackReference already used by another donation." },
        { status: 409 }
      );
    }
    console.error("[PATCH /api/donations/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to update donation." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   DELETE /api/donations/[id]
   Access: ADMIN only
───────────────────────────────────────────────────────────── */
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, ["ADMIN"]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;  
    const existing = await prisma.donation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Donation not found." }, { status: 404 });
    }

    await prisma.donation.delete({ where: { id } });

    // Roll back project currentAmount if it was a successful donation
    if (existing.paystackStatus === "SUCCESS" && existing.projectId) {
      await prisma.project.update({
        where: { id: existing.projectId },
        data:  { currentAmount: { decrement: existing.amount } },
      });
    }

    return NextResponse.json({ success: true, message: "Donation deleted." });
  } catch (err) {
    console.error("[DELETE /api/donations/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete donation." }, { status: 500 });
  }
});