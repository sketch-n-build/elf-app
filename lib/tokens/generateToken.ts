import jwt from "jsonwebtoken";
import { ElejeJwtPayload, JwtOptions, UserRole } from "../types/jwt";

/* ─────────────────────────────────────────────────────────────
   generateJwtToken

   Signs a JWT with only the claims this project needs.
   Strips out tenantId, allowedBranchIds, currentBranchId, etc.
   which were artefacts of a multi-tenant architecture.

   Usage:
     // Access token (short-lived)
     const accessToken = generateJwtToken(
       user.id,
       process.env.JWT_SECRET!,
       "15m",
       { email: user.email, role: user.role, isActive: user.isActive }
     );

     // Refresh token (long-lived, tie to a session)
     const refreshToken = generateJwtToken(
       user.id,
       process.env.JWT_REFRESH_SECRET!,
       "7d",
       { email: user.email, role: user.role, isActive: user.isActive,
         sessionId: crypto.randomUUID() }
     );
─────────────────────────────────────────────────────────────── */
export function generateJwtToken(
  id:        string,
  secret:    string,
  expiresIn: jwt.SignOptions["expiresIn"],
  opts?: {
    email:          string;
    role?:           UserRole;
    isActive?:       boolean;
    sessionId?:     string;
    emailVerified?: boolean;
  }
): string {

  const payload: Omit<ElejeJwtPayload, "iat" | "exp"> = {
    sub:           id,
    email:         opts?.email,
    role:          opts?.role,
    isActive:      opts?.isActive,
    emailVerified: opts?.emailVerified ?? false,

    // jti is only included when a sessionId is provided.
    // Useful for refresh tokens where you need per-token revocation.
    ...(opts?.sessionId && { jti: opts.sessionId }),
  };

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: "HS256",
  });
}