import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateJwtToken } from "@/lib/tokens/generateToken";
import { verifyJwt } from "@/lib/tokens/verifyJwt";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax" as const,
  path: "/",
};

export const POST = async (req: NextRequest) => {
  try {
    // ─── 1. Pull raw token from cookie ───────────────────────────────────
    const rawToken = req.cookies.get("refreshToken")?.value;

    if (!rawToken) {
      return NextResponse.json(
        { success: false, message: "No refresh token provided" },
        { status: 401 }
      );
    }

    // ─── 2. Verify JWT signature + expiry ────────────────────────────────
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing required environment variable: JWT_SECRET");

    let payload: { sub: string; email: string; role: string };
    try {
      payload = verifyJwt(rawToken, secret) as typeof payload;
    } catch {
      // JWT is expired or tampered — clear the cookie
      const res = NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 }
      );
      res.cookies.set({ ...COOKIE_OPTIONS, name: "refreshToken", value: "", maxAge: 0, expires: new Date(0) });
      return res;
    }

    const userId = payload.sub;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload" },
        { status: 401 }
      );
    }

    // ─── 3. Look up the stored hash by userId ────────────────────────────
    const stored = await prisma.refreshToken.findUnique({
      where: { userId },
    });

    if (!stored) {
      // Token was already rotated or the user logged out — possible replay attack
      const res = NextResponse.json(
        { success: false, message: "Refresh token not recognised" },
        { status: 401 }
      );
      res.cookies.set({ ...COOKIE_OPTIONS, name: "refreshToken", value: "", maxAge: 0, expires: new Date(0) });
      return res;
    }

    // ─── 4. Constant-time compare raw token against stored hash ──────────
    const isValid = await bcrypt.compare(rawToken, stored.tokenHash);

    if (!isValid) {
      // Hash mismatch — could be a stolen/replayed old token after rotation
      // Invalidate everything for this user as a precaution
      await prisma.refreshToken.deleteMany({ where: { userId } });
      const res = NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 }
      );
      res.cookies.set({ ...COOKIE_OPTIONS, name: "refreshToken", value: "", maxAge: 0, expires: new Date(0) });
      return res;
    }

    // ─── 5. Check DB-level expiry (belt + braces alongside JWT expiry) ───
    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
      const res = NextResponse.json(
        { success: false, message: "Refresh token has expired. Please log in again." },
        { status: 401 }
      );
      res.cookies.set({ ...COOKIE_OPTIONS, name: "refreshToken", value: "", maxAge: 0, expires: new Date(0) });
      return res;
    }

    // ─── 6. Fetch the user to ensure the account is still valid ─────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, isActive: true, emailVerified: true },
    });

    if (!user || !user.emailVerified) {
      await prisma.refreshToken.deleteMany({ where: { userId } });
      const res = NextResponse.json(
        { success: false, message: "Account not found or not verified" },
        { status: 401 }
      );
      res.cookies.set({ ...COOKIE_OPTIONS, name: "refreshToken", value: "", maxAge: 0, expires: new Date(0) });
      return res;
    }

    // ─── 7. Issue new access token ────────────────────────────────────────
    const newAccessToken = generateJwtToken(user.id, secret, "15m", {
      email: user.email,
      role: user.role,
    });

    // ─── 8. Rotate the refresh token ─────────────────────────────────────
    // Always issue a new refresh token and replace the stored hash.
    // This means each token can only be used once — if an old token is
    // replayed after rotation the hash won't match, and step 4 above will
    // wipe all tokens for the user (re-auth required).
    const newRefreshToken = generateJwtToken(user.id, secret, "8h", {
      email: user.email,
      role: user.role,
    });
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.deleteMany({ where: { userId } });
      await tx.refreshToken.create({
        data: {
          userId,
          tokenHash: newHashedRefreshToken,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        },
      });
    });

    // ─── 9. Return new access token + rotated refresh token cookie ────────
    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed",
        data: { accessToken: newAccessToken },
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return response;
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
};