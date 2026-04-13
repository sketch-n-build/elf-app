import { NextRequest, NextResponse } from "next/server";
// import { apiAuth } from "@/lib/apiAuth";
// import { requireRoles } from "@/lib/roleGuard";
import { uploadImage, cloudinaryReady } from "@/lib/cloudinary";
import { apiAuth } from "@/lib/api/auth";
import { requireRoles } from "@/lib/roleGuards";
import { UserRole } from "@prisma/client";

/**
 * POST /api/upload
 *
 * Accepts multipart/form-data with a single "file" field.
 * Returns { url, publicId, cloudinaryReady } — the url is safe to store
 * in any coverImage / avatarUrl column.
 *
 * Access: ADMIN, STAFF
 */
export const POST = apiAuth(async (req: NextRequest & { user: any }) => {
  const deny = requireRoles(req.user, [UserRole.ADMIN, UserRole.STAFF]);
  if (deny) return deny;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided. Send a multipart field named 'file'." },
        { status: 400 }
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type: ${file.type}. Allowed: jpg, png, webp, avif.` },
        { status: 422 }
      );
    }

    const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 5 MB." },
        { status: 422 }
      );
    }

    const folder = (formData.get("folder") as string | null) ?? "eleje-legacy";
    const { url, publicId } = await uploadImage(file, folder);

    return NextResponse.json(
      {
        success: true,
        data: {
          url,
          publicId,
          cloudinaryReady,
          note: cloudinaryReady
            ? undefined
            : "Cloudinary is not yet configured. A placeholder URL was returned.",
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { success: false, error: "Image upload failed." },
      { status: 500 }
    );
  }
});