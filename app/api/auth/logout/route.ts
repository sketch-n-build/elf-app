import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/tokens/verifyJwt";
import { NextRequest, NextResponse } from "next/server";
// import { verifyJwt } from "@/lib/tokens/generateToken"; // adjust to your actual verify helper

const CLEAR_COOKIE = {
  name: "refreshToken",
  value: "",
  maxAge: 0,
  expires: new Date(0),
  path: "/",
  httpOnly: true,
  // ✅ FIX: was "strict" here but "lax" in login — must be identical,
  //    otherwise the browser treats them as two separate cookies.
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV !== "development",
};

export const POST = async (req: NextRequest) => {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      // ✅ FIX: The DB stores a bcrypt hash of the refresh token, so you
      //    cannot query by the raw token value. Instead, decode the JWT to
      //    get the userId, then delete that user's row.
      //    If verification fails (tampered / expired token) we still clear
      //    the cookie — the token is unusable anyway.
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("Missing JWT_SECRET");

        const payload = verifyJwt(refreshToken, secret);

        await prisma.refreshToken.deleteMany({
          where: { userId: payload.sub as string },
        });
      } catch {
        // Token is invalid/expired — nothing to delete in the DB.
        // We still fall through and clear the cookie below.
      }
    }

    const res = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
    res.cookies.set(CLEAR_COOKIE);
    return res;
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    const res = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    res.cookies.set(CLEAR_COOKIE);
    return res;
  }
};