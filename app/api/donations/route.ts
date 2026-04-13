import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { Prisma, UserRole } from "@prisma/client";

/* ─────────────────────────────────────────────────────────────
   GET /api/donations
   Query params: page, limit, status, projectId, campaignId
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(req.url);
    const page       = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit      = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
    const status     = searchParams.get("status") ?? undefined;
    const projectId  = searchParams.get("projectId") ?? undefined;
    const campaignId = searchParams.get("campaignId") ?? undefined;
    const skip       = (page - 1) * limit;

    const where: Prisma.DonationWhereInput = {
      ...(status     && { paystackStatus: status as any }),
      ...(projectId  && { projectId }),
      ...(campaignId && { campaignId }),
    };

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          donor:    { select: { fullName: true, email: true, isAnonymous: true } },
          project:  { select: { id: true, title: true, slug: true } },
          campaign: { select: { id: true, title: true } },
        },
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: donations,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("[GET /api/donations]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch donations." }, { status: 500 });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/donations
   Creates a manual donation record (e.g. bank transfer / offline).
   For Paystack webhooks use a separate /api/webhooks/paystack route.
   Access: ADMIN, STAFF
───────────────────────────────────────────────────────────── */
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const body = await req.json();
    const {
      amount,
      currency           = "NGN",
      paystackReference,
      paystackStatus     = "SUCCESS",
      projectId,
      campaignId,
      // Donor details (will upsert by email or create anonymous)
      donorFullName,
      donorEmail,
      isAnonymous        = false,
      paidAt,
    } = body;

    if (!amount || !paystackReference) {
      return NextResponse.json(
        { success: false, error: "amount and paystackReference are required." },
        { status: 400 }
      );
    }

    // Upsert donor
    let donor = null;
    if (donorEmail && !isAnonymous) {
      donor = await prisma.donor.upsert({
        where:  { email: donorEmail } as any,
        update: { fullName: donorFullName, phone: body.donorPhone },
        create: {
          email:    donorEmail,
          fullName: donorFullName ?? null,
          phone:    body.donorPhone ?? null,
          isAnonymous: false,
        },
      });
    } else if (isAnonymous) {
      donor = await prisma.donor.create({
        data: { isAnonymous: true },
      });
    }

    const donation = await prisma.donation.create({
      data: {
        amount:            new Prisma.Decimal(amount),
        currency,
        paystackReference,
        paystackStatus,
        paidAt:            paidAt ? new Date(paidAt) : new Date(),
        ...(donor      && { donorId: donor.id }),
        ...(projectId  && { projectId }),
        ...(campaignId && { campaignId }),
      },
      include: {
        donor:    { select: { fullName: true, email: true, isAnonymous: true } },
        project:  { select: { id: true, title: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    // If linked to a project, update the project's currentAmount
    if (projectId && paystackStatus === "SUCCESS") {
      await prisma.project.update({
        where: { id: projectId },
        data:  { currentAmount: { increment: new Prisma.Decimal(amount) } },
      });
    }

    return NextResponse.json({ success: true, data: donation }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A donation with this paystackReference already exists." },
        { status: 409 }
      );
    }
    console.error("[POST /api/donations]", err);
    return NextResponse.json({ success: false, error: "Failed to create donation." }, { status: 500 });
  }
});