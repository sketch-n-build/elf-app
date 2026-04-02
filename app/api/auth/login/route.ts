import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { verifyEmailEmail } from "@/lib/email/email";
import { sendEmail } from "@/lib/email/sendEmail";
import { generateJwtToken } from "@/lib/tokens/generateToken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  // ✅ Use "lax" consistently across login/logout. "strict" breaks OAuth
  //    redirect flows and is generally too aggressive for same-site auth.
  sameSite: "lax" as const,
  path: "/",
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and Password are required!" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        role: true,
        emailVerified: true,
        verificationTokens: {
          select: {
            expires: true,
            updatedAt: true,
          },
        },
      },
    });

    const genericError = "Invalid credentials. Please check your information and try again.";

    if (!user) {
      return NextResponse.json({ success: false, error: genericError }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: genericError }, { status: 401 });
    }

    // ✅ FIX: Check email verification unconditionally first.
    //    Previously, if shouldResend was false the entire block was skipped
    //    and an unverified user would receive valid access/refresh tokens.
    if (!user.emailVerified) {
      const THROTTLE_TIME = 5 * 60 * 1000; // 5 minutes

      const shouldResend =
        !user.verificationTokens ||
        user.verificationTokens.expires < new Date() ||
        Date.now() - new Date(user.verificationTokens.updatedAt).getTime() > THROTTLE_TIME;

      if (shouldResend) {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("Missing required environment variable: JWT_SECRET");

        const token = generateJwtToken(user.id, secret, "1h");
        const hashedToken = await bcrypt.hash(token, 10);
        const verificationUrl = `${process.env.WEB_BASE_URL}/verify-email?userId=${user.id}&token=${token}`;

        await prisma.verificationToken.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            token: hashedToken,
            expires: new Date(Date.now() + 1000 * 60 * 60),
          },
          update: {
            token: hashedToken,
            expires: new Date(Date.now() + 1000 * 60 * 60),
          },
        });

        const { subject, html } = verifyEmailEmail(user, verificationUrl);
        await sendEmail({ email: user.email, subject, html });
      }

      // Always block unverified users — only the resend is throttled.
      return NextResponse.json(
        {
          success: false,
          message: shouldResend
            ? "Please verify your email. A new verification link has been sent."
            : "Please verify your email. Check your inbox (a link was recently sent).",
        },
        { status: 403 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing required environment variable: JWT_SECRET");

    const accessToken = generateJwtToken(user.id, secret, "15m", {
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateJwtToken(user.id, secret, "8h", {
      email: user.email,
      role: user.role,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId: user.id } });
      await tx.refreshToken.create({
        data: { userId: user.id, tokenHash: hashedRefreshToken },
      });
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: { accessToken },
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
};