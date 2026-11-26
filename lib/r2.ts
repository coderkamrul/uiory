import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
export const R2_BUCKET = process.env.R2_BUCKET || "component-media";
export const R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  ""
).replace(/\/+$/, "");

export const R2_CONFIGURED =
  !!ACCOUNT_ID && !!ACCESS_KEY_ID && !!SECRET_ACCESS_KEY && !!R2_PUBLIC_URL;

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!R2_CONFIGURED) {
    throw new Error("Cloudflare R2 is not configured in environment variables.");
  }
  if (!cachedClient) {
    cachedClient = new S3Client({
      region: "auto",
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
      },
    });
  }
  return cachedClient;
}

export function getR2PublicUrl(key: string): string {
  const cleanKey = key.replace(/^\/+/, "");
  return `${R2_PUBLIC_URL}/${cleanKey}`;
}

export function extractR2Key(urlOrKey: string, fallbackName?: string): string {
  if (!urlOrKey) return fallbackName || "";
  if (R2_PUBLIC_URL && urlOrKey.startsWith(R2_PUBLIC_URL)) {
    return urlOrKey.slice(R2_PUBLIC_URL.length).replace(/^\/+/, "");
  }
  try {
    const u = new URL(urlOrKey);
    return decodeURIComponent(u.pathname).replace(/^\/+/, "");
  } catch {
    return urlOrKey.replace(/^\/+/, "");
  }
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const cleanKey = key.replace(/^\/+/, "");
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: cleanKey,
      Body: body,
      ContentType: contentType || "application/octet-stream",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return getR2PublicUrl(cleanKey);
}

export interface R2MediaItem {
  name: string;
  url: string;
  type: "image" | "video";
  size?: number;
  created_at?: string;
}

export async function listR2Objects(limit = 500): Promise<R2MediaItem[]> {
  const client = getR2Client();
  const res = await client.send(
    new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      MaxKeys: limit,
    })
  );
  const items: R2MediaItem[] = [];
  for (const obj of res.Contents || []) {
    if (!obj.Key || obj.Key === ".emptyFolderPlaceholder") continue;
    const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(obj.Key);
    items.push({
      name: obj.Key,
      url: getR2PublicUrl(obj.Key),
      type: isVideo ? "video" : "image",
      size: obj.Size,
      created_at: obj.LastModified ? obj.LastModified.toISOString() : undefined,
    });
  }
  items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return items;
}

export async function deleteFromR2(urlOrKey: string, fallbackName?: string): Promise<void> {
  const key = extractR2Key(urlOrKey, fallbackName);
  if (!key) return;
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    })
  );
}
