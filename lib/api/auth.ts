import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface ElfJwtPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "STAFF" | "INVESTOR";
  iat: number;
  exp: number;
}

// ✅ NEW context type (IMPORTANT)
type RouteContext<Params> = {
  params: Promise<Params>;
};

type Handler<Params = any> = (
  req: NextRequest & { user: ElfJwtPayload },
  ctx: RouteContext<Params>
) => Promise<Response>;

export function apiAuth<Params = any>(handler: Handler<Params>) {
  return async (req: NextRequest, ctx: RouteContext<Params>) => {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = auth.startsWith("Bearer ")
      ? auth.split(" ")[1]
      : auth;

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("Missing JWT_SECRET");

      const payload = jwt.verify(token, secret) as ElfJwtPayload;

      (req as any).user = payload;

      // ✅ pass ctx correctly
      return handler(req as any, ctx);
    } catch {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
  };
}