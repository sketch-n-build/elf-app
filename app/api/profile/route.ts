import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/profile
// Returns the currently authenticated user's full profile.
// Access: Any authenticated user (ADMIN, STAFF, INVESTOR)
// ─────────────────────────────────────────────────────────────────────────────
export const GET = apiAuth(async (req: NextRequest & { user: any }) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id:            true,
        firstName:     true,
        lastName:      true,
        email:         true,
        role:          true,
        isActive:      true,
        emailVerified: true,
        createdAt:     true,
        profile: {
          select: {
            phone:     true,
            avatarUrl: true,
            bio:       true,
          },
        },
        _count: {
          select: {
            blogs:       true,
            projects:    true,
            investments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (err) {
    console.error("[GET /api/profile]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch profile." }, { status: 500 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/profile
// Let any authenticated user update their own name, bio, phone, avatarUrl.
// Password changes require currentPassword for verification.
// Access: Any authenticated user
// ─────────────────────────────────────────────────────────────────────────────
export const PATCH = apiAuth(async (req: NextRequest & { user: any }) => {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      // Profile fields
      phone,
      bio,
      avatarUrl,
      // Password change (both required together)
      currentPassword,
      newPassword,
    } = body;

    // ── Password change flow ───────────────────────────────────────────────
    if (newPassword || currentPassword) {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: "Both currentPassword and newPassword are required to change password." },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }

      const userWithPw = await prisma.user.findUnique({
        where:  { id: req.user.sub },
        select: { password: true },
      });

      if (!userWithPw) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, userWithPw.password);
      if (!passwordMatch) {
        return NextResponse.json(
          { success: false, error: "Current password is incorrect." },
          { status: 401 }
        );
      }

      const hashedNewPw = await bcrypt.hash(newPassword, 12);

      // Update password and invalidate all refresh tokens (force re-login on other devices)
      await prisma.$transaction([
        prisma.user.update({
          where: { id: req.user.sub },
          data:  { password: hashedNewPw },
        }),
        prisma.refreshToken.deleteMany({ where: { userId: req.user.sub } }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Password updated. All other sessions have been signed out.",
      });
    }

    // ── General profile update ─────────────────────────────────────────────
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.user.sub },
        data: {
          ...(firstName && { firstName }),
          ...(lastName  && { lastName  }),
        },
        select: {
          id:        true,
          firstName: true,
          lastName:  true,
          email:     true,
          role:      true,
          updatedAt: true,
        },
      }),

      // Upsert profile (created lazily on first update)
      prisma.profile.upsert({
        where:  { userId: req.user.sub },
        update: {
          ...(phone     !== undefined && { phone }),
          ...(bio       !== undefined && { bio }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        create: {
          userId:    req.user.sub,
          phone:     phone     ?? null,
          bio:       bio       ?? null,
          avatarUrl: avatarUrl ?? null,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/profile]", err);
    return NextResponse.json({ success: false, error: "Failed to update profile." }, { status: 500 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/profile
// Soft-delete: deactivates the account and revokes all sessions.
// The account can be reactivated by an Admin via /api/admin/users/[id].
// Access: Any authenticated user
// ─────────────────────────────────────────────────────────────────────────────
export const DELETE = apiAuth(async (req: NextRequest & { user: any }) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required to deactivate your account." },
        { status: 400 }
      );
    }

    const userWithPw = await prisma.user.findUnique({
      where:  { id: req.user.sub },
      select: { password: true, role: true },
    });

    if (!userWithPw) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (userWithPw.role === UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: "Admin accounts cannot self-deactivate." },
        { status: 403 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, userWithPw.password);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Incorrect password." }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { userId: req.user.sub } }),
      prisma.user.update({
        where: { id: req.user.sub },
        data:  { isActive: false },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Your account has been deactivated. Contact an administrator to reactivate it.",
    });
  } catch (err) {
    console.error("[DELETE /api/profile]", err);
    return NextResponse.json({ success: false, error: "Failed to deactivate account." }, { status: 500 });
  }
});