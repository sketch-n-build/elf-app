import { v2 as cloudinary } from "cloudinary";

const isConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const cloudinaryReady = isConfigured;

/**
 * Upload an image File to Cloudinary.
 * Returns a placeholder when Cloudinary env vars are not yet configured
 * so the rest of the app can keep working during development.
 */
export async function uploadImage(
  file: File,
  folder = "eleje-legacy"
): Promise<{ url: string; publicId: string | null }> {
  if (!isConfigured) {
    console.warn("[Cloudinary] Not configured — returning placeholder URL.");
    return { url: "/images/placeholder.jpg", publicId: null };
  }

  const bytes    = await file.arrayBuffer();
  const buffer   = Buffer.from(bytes);
  const base64   = buffer.toString("base64");
  const dataUri  = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/**
 * Delete a previously uploaded image by its Cloudinary public_id.
 * No-ops gracefully when Cloudinary is not configured or publicId is null.
 */
export async function deleteImage(publicId: string | null): Promise<void> {
  if (!isConfigured || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
}