// import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"
import { generateJwtToken } from "@/lib/tokens/generateToken";
import { verifyEmailEmail } from "@/lib/email/email";
import { sendEmail } from "@/lib/email/sendEmail";
import { prisma } from "@/lib/prisma";
// import { UserRole } from "@/app/generated/prisma"
import { UserRole } from "@prisma/client"  // ✅ not @/app/generated/prisma



// id          String   @id @default(uuid())
//   email       String   @unique
//   password    String
//   firstName   String
//   lastName    String
//   role        UserRole
//   isActive    Boolean  @default(true)
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt

//   profile     Profile?
//   projects    Project[]
//   blogs       Blog[]
//   investments Investment[]
//   verificationTokens VerificationToken[]
export const POST = async (request: NextRequest) => {

    try {
        let { email, password, firstName, lastName } = await request.json();
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json({success: false, message: "All fields are required" }, { status: 400 });
        }

        // Validate user inputs
        if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
            return NextResponse.json({
                success: false,
                message: "Password must contain letters, numbers and be at least 6 characters"
            }, { status: 400 });
        }

        // trim inputs
        email = email.trim().toLowerCase();
        firstName = firstName.trim();
        lastName = lastName.trim();

        // check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return NextResponse.json({success: false, message: "Email already registered" }, { status: 400 });
        }


        // Encrypt password
         password = await bcrypt.hash(password, 12);

        // create user
        const user = await prisma.user.create({
            data: {
                email,
                password,
                firstName,
                lastName,
                role: UserRole.ADMIN,
                isActive: false,
            }
        })

        if (!user) {
            return NextResponse.json({success: false, message: "Error creating user"})
        }

        // Generate verification token and send email
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("Missing required environment variable: JWT_SECRET");
    }

    const token = generateJwtToken(user.id, secret, "1h")
    const verificationUrl = `${process.env.WEB_BASE_URL}/verify-email?userId=${user.id}&token=${token}`;

    // Store token in the database
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: token,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    // send email to user with verificationUrl
    const { subject, html } = verifyEmailEmail(user, verificationUrl);
    const emailSent = await sendEmail({ email: user.email, subject, html });

    if (!emailSent) {
        return NextResponse.json({ success: false, message: "Error sending verification email" }, { status: 400 });
    }


        return NextResponse.json({ success: true, message: "Registration successful" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
    }
}