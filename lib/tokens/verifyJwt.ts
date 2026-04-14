import jwt, { JsonWebTokenError, TokenExpiredError, NotBeforeError } from "jsonwebtoken";
import { ElejeJwtPayload } from "../types/jwt";

/* ─────────────────────────────────────────────────────────────
   verifyJwt

   Verifies a token and returns the typed ElejeJwtPayload.
   Throws descriptive errors the calling code can catch and
   translate into HTTP responses.

   Usage:
     try {
       const payload = verifyJwt(token, process.env.JWT_SECRET!);
       // payload.sub   → user id
       // payload.role  → "ADMIN" | "STAFF" | "INVESTOR"
       // payload.isActive      → boolean
       // payload.emailVerified → boolean
     } catch (err) {
       // err.message will be one of the strings below
     }
─────────────────────────────────────────────────────────────── */
export function verifyJwt(token: string, secret: string): ElejeJwtPayload {
  try {
    const decoded = jwt.verify(token, secret) as ElejeJwtPayload;

    /*
      Extra runtime checks after signature validation.
      These guard against tokens that are technically valid but
      should be rejected by business logic.
    */
    if (!decoded.sub) {
      throw new Error("Token is missing subject claim.");
    }

    // if (!decoded.isActive) {
    //   throw new Error("This account has been deactivated. Please contact support.");
    // }

    return decoded;

  } catch (err: unknown) {

    // Let our own errors from the checks above pass through unchanged
    if (err instanceof Error && !(err instanceof JsonWebTokenError)) {
      throw err;
    }

    if (err instanceof TokenExpiredError) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (err instanceof NotBeforeError) {
      throw new Error("Token is not yet valid.");
    }

    if (err instanceof JsonWebTokenError) {
      throw new Error("Invalid token. Please log in again.");
    }

    throw new Error("An unexpected error occurred while verifying your session.");
  }
}