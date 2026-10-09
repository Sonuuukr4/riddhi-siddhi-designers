import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { cmsMode } from "@/lib/cms/env";
import { LOCAL_PATH_PATTERN, LOCAL_UPLOAD_DIR } from "@/lib/cms/local-repo";

/** Serves uploaded media in LOCAL PREVIEW mode. Production media is served by Supabase Storage. */

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (cmsMode() !== "local") return new NextResponse("Not found", { status: 404 });
  const objectPath = (await params).path.join("/");
  if (!LOCAL_PATH_PATTERN.test(objectPath)) return new NextResponse("Not found", { status: 404 });

  const file = path.join(LOCAL_UPLOAD_DIR, objectPath);
  let size: number;
  try {
    size = (await stat(file)).size;
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  const type = TYPES[objectPath.split(".").pop() ?? ""] ?? "application/octet-stream";
  const headers = {
    "content-type": type,
    "cache-control": "public, max-age=31536000, immutable",
    "accept-ranges": "bytes",
    "x-content-type-options": "nosniff",
  };

  // Byte ranges let browsers seek within videos.
  const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end)
      return new NextResponse(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
    return new NextResponse(stream, {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(end - start + 1) },
    });
  }
  const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
  return new NextResponse(stream, { headers: { ...headers, "content-length": String(size) } });
}
