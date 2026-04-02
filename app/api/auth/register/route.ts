import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { generateJwtToken } from "@/lib/tokens/generateToken";
import { verifyEmailEmail } from "@/lib/email/email";
import { sendEmail } from "@/lib/email/sendEmail";
import { UserRole } from "@prisma/client";

export const POST = async (request: NextRequest) => {
  try {
    let { email, password, firstName, lastName } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password must contain letters, numbers and be at least 6 characters",
        },
        { status: 400 }
      );
    }

    email = email.trim().toLowerCase();
    firstName = firstName.trim();
    lastName = lastName.trim();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        // ✅ FIX: Public registration must never create ADMINs.
        //    Admins should be seeded directly in the DB or created via a
        //    protected admin-only endpoint. Change to INVESTOR or whichever
        //    role your public sign-up flow targets.
        role: UserRole.INVESTOR,
        isActive: false,
      },
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("Missing required environment variable: JWT_SECRET");

    const token = generateJwtToken(user.id, secret, "1h");

    // ✅ FIX: Hash the token before storing it so the DB never holds a raw
    //    verifiable credential. verify-email already calls bcrypt.compare(),
    //    so it expects a hash here.
    const hashedToken = await bcrypt.hash(token, 10);

    const verificationUrl = `${process.env.WEB_BASE_URL}/verify-email?userId=${user.id}&token=${token}`;

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
      },
    });

    const { subject, html } = verifyEmailEmail(user, verificationUrl);
    const emailSent = await sendEmail({ email: user.email, subject, html });

    if (!emailSent) {
      // Roll back the user so they can retry registration cleanly
      await prisma.user.delete({ where: { id: user.id } });
      return NextResponse.json(
        { success: false, message: "Error sending verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Registration successful. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
};