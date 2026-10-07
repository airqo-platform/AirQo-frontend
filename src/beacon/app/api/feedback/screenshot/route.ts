import crypto from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Uploads a feedback screenshot to Cloudinary with a signed request, so the
 * API secret never reaches the browser. Signed-in users only, and always into
 * the feedback folder.
 */

const FOLDER = "feedback";
const TAGS = "beacon,feedback";
const VALID_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("[beacon-web/feedback] Cloudinary is not configured; screenshot not uploaded");
    return NextResponse.json(
      { success: false, error: "Screenshot uploads are not configured" },
      { status: 503 }
    );
  }

  let file: File | null;
  try {
    const formData = await req.formData();
    const entry = formData.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return NextResponse.json({ success: false, error: "Invalid upload" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }
  if (!VALID_TYPES.has(file.type)) {
    return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ success: false, error: "File too large (max 2MB)" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000).toString();
  // Cloudinary signs the alphabetically sorted parameters followed by the secret.
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${FOLDER}&tags=${TAGS}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append("file", file);
  cloudinaryFormData.append("api_key", apiKey);
  cloudinaryFormData.append("timestamp", timestamp);
  cloudinaryFormData.append("signature", signature);
  cloudinaryFormData.append("folder", FOLDER);
  cloudinaryFormData.append("tags", TAGS);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: cloudinaryFormData,
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();

    if (!response.ok) {
      console.error("[beacon-web/feedback] Cloudinary rejected the upload:", result?.error?.message);
      return NextResponse.json(
        { success: false, error: "Failed to upload screenshot" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: unknown) {
    console.error("[beacon-web/feedback] Screenshot upload failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload screenshot" },
      { status: 502 }
    );
  }
}
