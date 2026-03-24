// import { ElejeJwtPayload, UserRole } from "../types/jwt";

import { ElejeJwtPayload, UserRole } from "./types/jwt";

/* ─────────────────────────────────────────────────────────────
   Role guard helpers.

   Use these in route handlers or middleware to check what the
   decoded JWT payload is allowed to do.

   Usage in an API route:
     const payload = verifyJwt(token, process.env.JWT_SECRET!);

     if (!isAdmin(payload)) {
       return res.status(403).json({ message: "Admins only." });
     }

   Usage in Next.js middleware:
     if (!hasRole(payload, ["ADMIN", "STAFF"])) {
       return NextResponse.redirect(new URL("/", req.url));
     }
─────────────────────────────────────────────────────────────── */

/** True if the token belongs to an ADMIN */
export function isAdmin(payload: ElejeJwtPayload): boolean {
  return payload.role === "ADMIN";
}

/** True if the token belongs to a STAFF member */
export function isStaff(payload: ElejeJwtPayload): boolean {
  return payload.role === "STAFF";
}

/** True if the token belongs to an INVESTOR */
export function isInvestor(payload: ElejeJwtPayload): boolean {
  return payload.role === "INVESTOR";
}

/** True if the token role is in the provided list */
export function hasRole(payload: ElejeJwtPayload, roles: UserRole[]): boolean {
  return roles.includes(payload.role);
}

/** True if the user has verified their email */
export function isEmailVerified(payload: ElejeJwtPayload): boolean {
  return payload.emailVerified === true;
}

/** True if the account is active (not soft-deleted / deactivated) */
export function isActiveUser(payload: ElejeJwtPayload): boolean {
  return payload.isActive === true;
}

/*
  Convenience guard that combines the two most common checks:
  active account + email verified.
  Use before any sensitive action (e.g. investing, posting content).
*/
export function isFullyVerified(payload: ElejeJwtPayload): boolean {
  return isActiveUser(payload) && isEmailVerified(payload);
}