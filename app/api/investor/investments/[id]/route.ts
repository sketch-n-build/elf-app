import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

// DELETE /api/investor/investments/[id] — cancel own investment
export const DELETE = apiAuth<{ id: string }>(async (req, ctx) => {
  const deny = requireRoles(req.user, [UserRole.INVESTOR]);
  if (deny) return deny;

  try {
    const { id } = await ctx!.params;
    const investment = await prisma.investment.findUnique({ where: { id } });
    if (!investment) {
      return NextResponse.json({ success: false, error: "Investment not found." }, { status: 404 });
    }

    // Investors can only delete their own
    if (investment.userId !== req.user.sub) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
    }

    await prisma.investment.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Investment cancelled." });
  } catch (err) {
    console.error("[DELETE /api/investor/investments/:id]", err);
    return NextResponse.json({ success: false, error: "Failed to cancel investment." }, { status: 500 });
  }
});