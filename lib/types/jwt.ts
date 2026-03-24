import { JwtPayload } from "jsonwebtoken";

/* ─────────────────────────────────────────────────────────────
   UserRole must mirror the Prisma enum exactly.
   Prisma enum:  ADMIN | STAFF | INVESTOR
─────────────────────────────────────────────────────────────── */
export type UserRole = "ADMIN" | "STAFF" | "INVESTOR";

/* ─────────────────────────────────────────────────────────────
   What we embed in every JWT for this project.

   Standard JWT claims (from JwtPayload):
     sub  → user.id
     iat  → issued at  (set automatically by jsonwebtoken)
     exp  → expiry     (set automatically by jsonwebtoken)
     jti  → unique token id (used as sessionId for revocation)

   Custom claims:
     role          → UserRole
     email         → user.email   (avoids DB hit in middleware)
     isActive      → user.isActive (block suspended accounts fast)
     emailVerified → true once the VerificationToken has been consumed
─────────────────────────────────────────────────────────────── */
export interface ElejeJwtPayload extends JwtPayload {
  sub:            string;       // user.id
  email:          string;       // user.email
  role:           UserRole;     // ADMIN | STAFF | INVESTOR
  isActive:       boolean;      // user.isActive
  emailVerified:  boolean;      // true after VerificationToken consumed
  jti?:           string;       // optional session id
}

/* ─────────────────────────────────────────────────────────────
   Options accepted by generateJwtToken()
─────────────────────────────────────────────────────────────── */
export interface JwtOptions {
  sessionId?:     string;   // stored as jti
  emailVerified?: boolean;  // defaults to false
}