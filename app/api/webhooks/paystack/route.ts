import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/webhooks/paystack
//
// Receives real-time payment events from Paystack. This route is intentionally
// NOT behind apiAuth — Paystack calls it server-to-server with no Bearer token.
// Instead, we verify the HMAC-SHA512 signature Paystack attaches to every
// request via the X-Paystack-Signature header.
//
// Env var required: PAYSTACK_SECRET_KEY
//
// Paystack dashboard: Settings → API Keys & Webhooks → Webhook URL
// Set to: https://yourdomain.com/api/webhooks/paystack
// ─────────────────────────────────────────────────────────────────────────────

/** Verify Paystack HMAC-SHA512 signature */
function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  // Timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  // ── 1. Read raw body for signature verification ────────────────────────────
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifySignature(rawBody, signature)) {
    console.warn("[Paystack Webhook] Invalid signature — request rejected.");
    return NextResponse.json({ success: false }, { status: 401 });
  }

  let event: Record<string, any>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Malformed JSON" }, { status: 400 });
  }

  // ── 2. Route by event type ────────────────────────────────────────────────
  try {
    switch (event.event) {
      case "charge.success":
        await handleChargeSuccess(event.data);
        break;

      case "charge.failed":
        await handleChargeFailed(event.data);
        break;

      case "refund.processed":
        await handleRefundProcessed(event.data);
        break;

      default:
        // Unknown event — acknowledge without processing
        console.info(`[Paystack Webhook] Unhandled event: ${event.event}`);
    }
  } catch (err) {
    // Always return 200 to Paystack — otherwise it will retry indefinitely.
    // Log the error internally and investigate via your logging service.
    console.error("[Paystack Webhook] Handler error:", err);
  }

  // Paystack expects a 200 OK quickly — any non-200 triggers retries
  return NextResponse.json({ success: true }, { status: 200 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────────────────────────────────────

async function handleChargeSuccess(data: Record<string, any>) {
  const {
    reference,
    amount,          // Paystack sends amount in KOBO (1 NGN = 100 kobo)
    currency = "NGN",
    paid_at,
    customer,
    metadata,        // Use metadata to pass projectId / campaignId from your frontend
  } = data;

  if (!reference) {
    console.warn("[Paystack Webhook] charge.success missing reference — skipped.");
    return;
  }

  // Convert kobo → naira
  const amountNaira = new Prisma.Decimal(amount).div(100);

  // Upsert donor (idempotent — same email = same donor record)
  let donor: { id: string } | null = null;

  // let donor = null;

if (customer?.email) {
  donor = await prisma.donor.findFirst({
    where: { email: customer.email },
    select: { id: true },
  });

  if (!donor) {
    donor = await prisma.donor.create({
      data: {
        email: customer.email,
        fullName: customer.name ?? null,
        isAnonymous: false,
      },
      select: { id: true },
    });
  } else {
    await prisma.donor.update({
      where: { id: donor.id },
      data: { fullName: customer.name ?? undefined },
    });
  }
}
  // if (customer?.email) {
  //   donor = await prisma.donor.upsert({
  //     where:  { email: customer.email },
  //     update: { fullName: customer.name ?? undefined },
  //     create: {
  //       email:      customer.email,
  //       fullName:   customer.name  ?? null,
  //       isAnonymous: false,
  //     },
  //     select: { id: true },
  //   });
  // }

  // Upsert donation — idempotent on paystackReference so retries are safe
  const donation = await prisma.donation.upsert({
    where:  { paystackReference: reference },
    update: {
      paystackStatus: "SUCCESS",
      paidAt:         paid_at ? new Date(paid_at) : new Date(),
    },
    create: {
      paystackReference: reference,
      paystackStatus:    "SUCCESS",
      amount:            amountNaira,
      currency,
      paidAt:            paid_at ? new Date(paid_at) : new Date(),
      ...(donor?.id    && { donorId:    donor.id }),
      ...(metadata?.projectId  && { projectId:  metadata.projectId }),
      ...(metadata?.campaignId && { campaignId: metadata.campaignId }),
    },
  });

  // Update project.currentAmount only on new SUCCESS (not on idempotent re-delivery)
  if (donation.projectId && metadata?.projectId) {
    // Only increment if this reference was newly created (not an update to existing SUCCESS)
    const wasAlreadySuccess = await prisma.donation.findFirst({
      where: {
        paystackReference: reference,
        paystackStatus:    "SUCCESS",
      },
    });

    // If this was a create (not update), increment
    if (!wasAlreadySuccess || wasAlreadySuccess.id === donation.id) {
      await prisma.project.update({
        where: { id: metadata.projectId },
        data:  { currentAmount: { increment: amountNaira } },
      });
    }
  }

  console.info(`[Paystack Webhook] charge.success — ref: ${reference}, amount: ₦${amountNaira}`);
}

async function handleChargeFailed(data: Record<string, any>) {
  const { reference } = data;
  if (!reference) return;

  // Mark existing donation as FAILED, or create a FAILED record
  await prisma.donation.upsert({
    where:  { paystackReference: reference },
    update: { paystackStatus: "FAILED" },
    create: {
      paystackReference: reference,
      paystackStatus:    "FAILED",
      amount:            new Prisma.Decimal(data.amount ?? 0).div(100),
      currency:          data.currency ?? "NGN",
    },
  });

  console.info(`[Paystack Webhook] charge.failed — ref: ${reference}`);
}

async function handleRefundProcessed(data: Record<string, any>) {
  const { transaction_reference, amount } = data;
  if (!transaction_reference) return;

  const donation = await prisma.donation.findUnique({
    where: { paystackReference: transaction_reference },
  });

  if (!donation) {
    console.warn(`[Paystack Webhook] refund.processed — no donation found for ref: ${transaction_reference}`);
    return;
  }

  // Roll back project currentAmount for the refunded amount
  const refundedNaira = new Prisma.Decimal(amount).div(100);

  if (donation.projectId && donation.paystackStatus === "SUCCESS") {
    await prisma.project.update({
      where: { id: donation.projectId },
      data:  { currentAmount: { decrement: refundedNaira } },
    });
  }

  // Update donation status to reflect refund
  await prisma.donation.update({
    where: { paystackReference: transaction_reference },
    data:  { paystackStatus: "FAILED" }, // use FAILED as "refunded/reversed"
  });

  console.info(`[Paystack Webhook] refund.processed — ref: ${transaction_reference}, refunded: ₦${refundedNaira}`);
}