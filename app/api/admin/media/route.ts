import { NextRequest, NextResponse } from "next/server";
import {
  deleteFromR2,
  listR2Objects,
  R2_CONFIGURED,
  uploadToR2,
} from "@/lib/r2";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

export async function GET() {
  if (!R2_CONFIGURED) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured." },
      { status: 503 }
    );
  }
  try {
    const items = await listR2Objects();
    return NextResponse.json({ items });
  } catch (err: unknown) {
    console.error("R2 list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list media." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!R2_CONFIGURED) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured." },
      { status: 503 }
    );
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is empty or exceeds 50 MB limit." },
        { status: 400 }
      );
    }

    const isVideo =
      file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: "Only image and video files are supported." },
        { status: 400 }
      );
    }

    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const key = `${Date.now()}-${safe}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2(
      key,
      buffer,
      file.type || (isVideo ? "video/mp4" : "application/octet-stream")
    );

    return NextResponse.json({
      url,
      name: key,
      type: isVideo ? "video" : "image",
      size: file.size,
    });
  } catch (err: unknown) {
    console.error("R2 upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!R2_CONFIGURED) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured." },
      { status: 503 }
    );
  }
  try {
    const body = await req.json().catch(() => ({}));
    const url = typeof body?.url === "string" ? body.url : "";
    const name = typeof body?.name === "string" ? body.name : undefined;
    await deleteFromR2(url, name);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("R2 delete error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 }
    );
  }
}
