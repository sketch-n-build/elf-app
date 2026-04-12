import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateJwtToken } from "@/lib/tokens/generateToken";
import { sendEmail } from "@/lib/email/sendEmail";
import { passwordResetEmail } from "@/lib/email/email"; // add this template (see note below)

const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes — same pattern as verify-email

export const POST = async (request: NextRequest) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // ✅ Always return 200 regardless of whether the email exists.
    //    Returning 404 when the email isn't found leaks account existence
    //    and enables user enumeration attacks.
    const GENERIC_OK = {
      success: true,
      message: "If that email is registered you will receive a password reset link shortly.",
    };

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return NextResponse.json(GENERIC_OK, { status: 200 });
    }

    // Throttle: check if a token was recently sent so we don't spam the user
    const existing = await prisma.passwordResetToken.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      const timeSinceLast = Date.now() - new Date(existing.updatedAt).getTime();
      if (timeSinceLast < THROTTLE_MS) {
        // Still within the throttle window — silently succeed (no new email)
        return NextResponse.json(GENERIC_OK, { status: 200 });
      }
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing required environment variable: JWT_SECRET");

    const token = generateJwtToken(user.id, secret, "15m"); // short window for security
    const hashedToken = await bcrypt.hash(token, 10);
    const resetUrl = `${process.env.WEB_BASE_URL}/auth/reset-password?userId=${user.id}&token=${token}`;

    // Upsert so re-requests overwrite the old token
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        token: hashedToken,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
      update: {
        token: hashedToken,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const { subject, html } = passwordResetEmail(user, resetUrl);
    await sendEmail({ email: user.email, subject, html });

    return NextResponse.json(GENERIC_OK, { status: 200 });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
};