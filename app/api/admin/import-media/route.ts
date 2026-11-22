import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const DEMO_FALLBACK_URL =
  "https://ttlpdghpwefufqrppmsv.supabase.co/storage/v1/object/public/component-media/1793027269194-site-background.webp";
const MEDIA_BUCKET = "component-media";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const mediaUrl = typeof body?.mediaUrl === "string" ? body.mediaUrl.trim() : "";
    const title = typeof body?.title === "string" ? body.title.trim() : "imported-media";

    // If mediaUrl is missing or already points to the demo fallback, return it directly
    if (!mediaUrl || mediaUrl === DEMO_FALLBACK_URL) {
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
      });
    }

    // Skip Mux streams, HLS/DASH playlists (.m3u8, .mpd) or external video page embeds
    const isStreamOrPlaylist =
      /\.(m3u8|mpd)(\?.*)?$/i.test(mediaUrl) ||
      mediaUrl.includes("stream.mux.com") ||
      mediaUrl.includes("mux.com") ||
      mediaUrl.includes("youtube.com") ||
      mediaUrl.includes("youtu.be") ||
      mediaUrl.includes("vimeo.com");

    if (isStreamOrPlaylist) {
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
        warning: "Streaming playlist (Mux/HLS) detected. Skipped download and used default demo media.",
      });
    }

    // Check if the URL is already hosted in the component-media bucket
    if (mediaUrl.includes(`/${MEDIA_BUCKET}/`)) {
      const isVideo =
        /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(mediaUrl);
      return NextResponse.json({
        success: true,
        url: mediaUrl,
        type: isVideo ? "video" : "image",
        fallback: false,
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // If Supabase is not configured, fallback to demo
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
        reason: "Supabase not configured",
      });
    }

    // Fetch the remote media URL (15-second timeout)
    let response: Response;
    try {
      response = await fetch(mediaUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "image/*,video/*,*/*",
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchErr) {
      console.warn("Failed to fetch remote media:", mediaUrl, fetchErr);
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
        warning: "Could not fetch media URL. Used demo fallback.",
      });
    }

    if (!response.ok) {
      console.warn(`Media download returned status ${response.status}:`, mediaUrl);
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
        warning: `Media responded with HTTP ${response.status}. Used demo fallback.`,
      });
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    const isVideo =
      contentType.startsWith("video/") ||
      /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(mediaUrl);
    const mediaType: "image" | "video" = isVideo ? "video" : "image";

    // Determine safe extension
    let ext = isVideo ? "mp4" : "webp";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("jpeg") || contentType.includes("jpg")) ext = "jpg";
    else if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("webm")) ext = "webm";
    else if (contentType.includes("quicktime")) ext = "mov";
    else {
      const match = mediaUrl.match(/\.([a-zA-Z0-9]{3,4})(\?.*)?$/);
      if (match && match[1]) {
        ext = match[1].toLowerCase();
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Guard against oversized files (50 MB limit)
    if (buffer.length === 0 || buffer.length > 50 * 1024 * 1024) {
      console.warn("Media file invalid or exceeded size limit:", buffer.length);
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
        warning: "Media was empty or exceeded 50MB. Used demo fallback.",
      });
    }

    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .slice(0, 40)
      .replace(/^-+|-+$/g, "");
    const filename = `${Date.now()}-${safeTitle || "media"}.${ext}`;

    const authHeader = req.headers.get("authorization");
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filename, buffer, {
        contentType: contentType || (isVideo ? "video/mp4" : "image/webp"),
        upsert: false,
      });

    if (uploadError) {
      console.warn("Supabase storage upload error:", uploadError);
      return NextResponse.json({
        success: true,
        url: DEMO_FALLBACK_URL,
        type: "image",
        fallback: true,
        warning: `Upload error: ${uploadError.message}. Used demo fallback.`,
      });
    }

    const { data: pubData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: pubData.publicUrl,
      type: mediaType,
      fallback: false,
    });
  } catch (err: unknown) {
    console.error("import-media error:", err);
    return NextResponse.json({
      success: true,
      url: DEMO_FALLBACK_URL,
      type: "image",
      fallback: true,
      warning: "Internal error processing media. Used demo fallback.",
    });
  }
}
