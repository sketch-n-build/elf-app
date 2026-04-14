import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users/[id]
// Full user profile including content counts and profile details.
// Access: ADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export const GET = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN]);
  if (deny) return deny;

  const { id } = await ctx.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id:            true,
        firstName:     true,
        lastName:      true,
        email:         true,
        role:          true,
        isActive:      true,
        emailVerified: true,
        createdAt:     true,
        updatedAt:     true,
        profile:       true,
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
    console.error("[GET /api/admin/users/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to fetch user." }, { status: 500 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/users/[id]
// Update any user's details. Admin cannot demote/promote another Admin.
// To change role, use the dedicated PATCH /api/admin/users/[id]/role route.
// Access: ADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export const PATCH = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    // Admins cannot edit other Admins via this route (prevents privilege escalation)
    if (user.role === "ADMIN" && user.id !== req.user.sub) {
      return NextResponse.json(
        { success: false, error: "Admins cannot modify other Admin accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, email, isActive, emailVerified, newPassword } = body;

    // Check email collision
    if (email && email !== user.email) {
      const conflict = await prisma.user.findUnique({ where: { email } });
      if (conflict) {
        return NextResponse.json(
          { success: false, error: "That email is already in use." },
          { status: 409 }
        );
      }
    }

    let hashedPassword: string | undefined;
    if (newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(newPassword, 12);

      // Invalidate all refresh tokens so the user must re-login
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName      && { firstName }),
        ...(lastName       && { lastName }),
        ...(email          && { email: email.trim().toLowerCase() }),
        ...(isActive       !== undefined && { isActive }),
        ...(emailVerified  !== undefined && { emailVerified }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id:            true,
        firstName:     true,
        lastName:      true,
        email:         true,
        role:          true,
        isActive:      true,
        emailVerified: true,
        updatedAt:     true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Email already in use." },
        { status: 409 }
      );
    }
    console.error("[PATCH /api/admin/users/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to update user." }, { status: 500 });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/[id]
// Deactivates (soft) or hard-deletes a user.
// Admins cannot delete other Admins. Admins cannot delete themselves.
// Default: soft-delete (isActive = false). Pass ?hard=true for permanent delete.
// Access: ADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const hard = searchParams.get("hard") === "true";

    if (id === req.user.sub) {
      return NextResponse.json(
        { success: false, error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin accounts cannot be deleted via this route." },
        { status: 403 }
      );
    }

    if (hard) {
      // Hard delete — cascades via DB if FK constraints are set,
      // otherwise manually clean related data first
      await prisma.$transaction([
        prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
        prisma.verificationToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        // Blogs & projects authored by this user become orphaned — nullify or reassign
        // For safety, we soft-delete them too
        prisma.blog.updateMany({
          where: { authorId: user.id },
          data:  { isPublished: false },
        }),
        prisma.project.updateMany({
          where: { createdById: user.id },
          data:  { status: "PAUSED" },
        }),
        prisma.user.delete({ where: { id: user.id } }),
      ]);

      return NextResponse.json({ success: true, message: "User permanently deleted." });
    }

    // Soft delete — revoke sessions, mark inactive
    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
      prisma.user.update({
        where: { id: user.id },
        data:  { isActive: false },
      }),
    ]);

    return NextResponse.json({ success: true, message: "User deactivated." });
  } catch (err) {
    console.error("[DELETE /api/admin/users/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to delete user." }, { status: 500 });
  }
});