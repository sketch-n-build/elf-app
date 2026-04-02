import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export const POST = async (request: NextRequest) => {
  try {
    const { userId, token, newPassword } = await request.json();

    if (!userId || !token || !newPassword) {
      return NextResponse.json(
        { success: false, message: "userId, token, and newPassword are required" },
        { status: 400 }
      );
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain letters, numbers and be at least 6 characters",
        },
        { status: 400 }
      );
    }

    // Use a single generic error for all token/user failures to avoid
    // leaking which part of validation failed.
    const GENERIC_ERROR = {
      success: false,
      message: "Invalid or expired password reset link",
    };

    const dbToken = await prisma.passwordResetToken.findUnique({
      where: { userId },
    });

    if (!dbToken) {
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    if (dbToken.expires < new Date()) {
      // Clean up the expired token so the table stays lean
      await prisma.passwordResetToken.delete({ where: { userId } });
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    const isValid = await bcrypt.compare(token, dbToken.token);
    if (!isValid) {
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atomically update the password, delete the reset token, and
    // invalidate all active refresh tokens so any stolen sessions
    // are immediately revoked.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { userId },
      }),
      prisma.refreshToken.deleteMany({
        where: { userId },
      }),
    ]);

    return NextResponse.json(
      { success: true, message: "Password reset successfully. Please log in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
};