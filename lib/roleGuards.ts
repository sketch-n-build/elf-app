// // import { ElejeJwtPayload, UserRole } from "../types/jwt";

// import { ElejeJwtPayload, UserRole } from "./types/jwt";

// /* ─────────────────────────────────────────────────────────────
//    Role guard helpers.

//    Use these in route handlers or middleware to check what the
//    decoded JWT payload is allowed to do.

//    Usage in an API route:
//      const payload = verifyJwt(token, process.env.JWT_SECRET!);

//      if (!isAdmin(payload)) {
//        return res.status(403).json({ message: "Admins only." });
//      }

//    Usage in Next.js middleware:
//      if (!hasRole(payload, ["ADMIN", "STAFF"])) {
//        return NextResponse.redirect(new URL("/", req.url));
//      }
// ─────────────────────────────────────────────────────────────── */

// /** True if the token belongs to an ADMIN */
// export function isAdmin(payload: ElejeJwtPayload): boolean {
//   return payload.role === "ADMIN";
// }

// /** True if the token belongs to a STAFF member */
// export function isStaff(payload: ElejeJwtPayload): boolean {
//   return payload.role === "STAFF";
// }

// /** True if the token belongs to an INVESTOR */
// export function isInvestor(payload: ElejeJwtPayload): boolean {
//   return payload.role === "INVESTOR";
// }

// /** True if the token role is in the provided list */
// export function hasRole(payload: ElejeJwtPayload, roles: UserRole[]): boolean {
//   return roles.includes(payload.role);
// }

// /** True if the user has verified their email */
// export function isEmailVerified(payload: ElejeJwtPayload): boolean {
//   return payload.emailVerified === true;
// }

// /** True if the account is active (not soft-deleted / deactivated) */
// export function isActiveUser(payload: ElejeJwtPayload): boolean {
//   return payload.isActive === true;
// }

// /*
//   Convenience guard that combines the two most common checks:
//   active account + email verified.
//   Use before any sensitive action (e.g. investing, posting content).
// */
// export function isFullyVerified(payload: ElejeJwtPayload): boolean {
//   return isActiveUser(payload) && isEmailVerified(payload);
// }

import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

/* ──────────────────────────────────────────────
   ROLE DEFINITIONS (Single Source of Truth)
────────────────────────────────────────────── */
export const ROLES = [UserRole.ADMIN, UserRole.STAFF, UserRole.INVESTOR] as const;
export type Role = (typeof ROLES)[number];

/* ──────────────────────────────────────────────
   UNIFIED JWT PAYLOAD TYPE
────────────────────────────────────────────── */
export interface JwtPayload {
  sub: string; // user id
  role: Role;

  // optional flags (depending on your token structure)
  emailVerified?: boolean;
  isActive?: boolean;
}

/* ──────────────────────────────────────────────
   PURE ROLE CHECKS (Framework Agnostic)
────────────────────────────────────────────── */

/** True if ADMIN */
export const isAdmin = (user: JwtPayload): boolean =>
  user.role === "ADMIN";

/** True if STAFF */
export const isStaff = (user: JwtPayload): boolean =>
  user.role === "STAFF";

/** True if INVESTOR */
export const isInvestor = (user: JwtPayload): boolean =>
  user.role === "INVESTOR";

/** True if role is in allowed list */
export const hasRole = (user: JwtPayload, roles: Role[]): boolean =>
  roles.includes(user.role);

/** Email verification check */
export const isEmailVerified = (user: JwtPayload): boolean =>
  user.emailVerified === true;

/** Active account check */
export const isActiveUser = (user: JwtPayload): boolean =>
  user.isActive === true;

/** Combined safety check */
export const isFullyVerified = (user: JwtPayload): boolean =>
  isActiveUser(user) && isEmailVerified(user);

/**
 * Resource ownership rule:
 * - ADMIN → can modify anything
 * - Others → only their own resource
 */
export const canModify = (user: JwtPayload, ownerId: string): boolean =>
  user.role === "ADMIN" || user.sub === ownerId;

/* ──────────────────────────────────────────────
   NEXT.JS HELPERS (Framework-Specific Layer)
────────────────────────────────────────────── */

/**
 * Returns 403 response if user lacks required roles
 * Returns null if access is allowed
 */
export function requireRoles(
  user: JwtPayload,
  allowedRoles: Role[]
): NextResponse | null {
  if (!hasRole(user, allowedRoles)) {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden: insufficient permissions.",
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Enforce active + verified user before sensitive actions
 */
export function requireFullyVerified(
  user: JwtPayload
): NextResponse | null {
  if (!isFullyVerified(user)) {
    return NextResponse.json(
      {
        success: false,
        error: "Account not fully verified.",
      },
      { status: 403 }
    );
  }

  return null;
}