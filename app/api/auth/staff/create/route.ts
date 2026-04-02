import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt"
import { welcomeStaffEmail } from "@/lib/email/email";
import { sendEmail } from "@/lib/email/sendEmail";
// import { UserRole } from "@/app/generated/prisma"
import { UserRole } from "@prisma/client"  // ✅ not @/app/generated/prisma
import { generateStrongPassword } from "@/lib/helpers/passwordGenerator";

export const POST = async (request: NextRequest) => {

    try {
        let { email, firstName, lastName } = await request.json();
        if (!email || !firstName || !lastName) {
            return NextResponse.json({success: false, message: "All fields are required" }, { status: 400 });
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

        // Validate user inputs
        // if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password)) {
        //     return NextResponse.json({
        //         success: false,
        //         message: "Password must contain letters, numbers and be at least 6 characters"
        //     }, { status: 400 });
        // }

        // Encrypt password
        //  password = await bcrypt.hash(password, 12);

        // generate strong random password for staff. Password should be atleast 6 chars including Uppercase, Lowercase, number and special character
        const password = generateStrongPassword(12);
        const hashedPassword = await bcrypt.hash(password, 12);

        // create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: UserRole.STAFF,
                isActive: false,
            }
        })

        if (!user) {
            return NextResponse.json({success: false, message: "Error creating user"})
        }

    // send email to user with verificationUrl
    const { subject, html } = welcomeStaffEmail(user, password);
    const emailSent = await sendEmail({ email: user.email, subject, html });

    if (!emailSent) {
        return NextResponse.json({ success: false, message: "Error sending verification email" }, { status: 400 });
    }


        return NextResponse.json({ success: true, message: "Registration successful" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 });
    }
}

