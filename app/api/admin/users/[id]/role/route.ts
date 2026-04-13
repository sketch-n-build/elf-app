import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/users/[id]/role
//
// Promotes or demotes a user's role. Separated from the main user PATCH
// intentionally — role changes are high-impact and deserve their own audit
// surface, clear intent in logs, and tighter validation.
//
// Rules:
//   - Cannot change your own role (prevents accidental self-lockout)
//   - Cannot change another Admin's role
//   - Cannot promote to ADMIN via API (must be done directly in the DB)
//   - Valid transitions: STAFF ↔ INVESTOR
//
// Access: ADMIN only
// ─────────────────────────────────────────────────────────────────────────────
export const PATCH = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN]);
  if (deny) return deny;

  try {
    const { id } = await ctx.params;
    if (id === req.user.sub) {
      return NextResponse.json(
        { success: false, error: "You cannot change your own role." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { role } = body;

    const ALLOWED_ROLES = ["STAFF", "INVESTOR"];
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `role must be one of: ${ALLOWED_ROLES.join(", ")}. Promoting to ADMIN must be done directly in the database.` },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    if (target.role === "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot change the role of an Admin account." },
        { status: 403 }
      );
    }

    if (target.role === role) {
      return NextResponse.json(
        { success: false, error: `User is already a ${role}.` },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data:  { role },
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        email:     true,
        role:      true,
        updatedAt: true,
      },
    });

    // Invalidate existing sessions — new role takes effect on next login
    await prisma.refreshToken.deleteMany({ where: { userId: id } });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}. Their existing session has been invalidated.`,
      data: updated,
    });
  } catch (err) {
    console.error("[PATCH /api/admin/users/:id/role]", err);
    return NextResponse.json({ success: false, error: "Failed to update user role." }, { status: 500 });
  }
});