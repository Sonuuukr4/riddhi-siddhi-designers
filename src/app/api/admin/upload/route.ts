import { createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { NextResponse } from "next/server";
import { getAuthState } from "@/lib/auth/session";
import { cmsMode } from "@/lib/cms/env";
import { checkUpload } from "@/lib/cms/limits";
import { LOCAL_PATH_PATTERN, LOCAL_UPLOAD_DIR } from "@/lib/cms/local-repo";

/**
 * Upload endpoint for LOCAL PREVIEW mode only. In production (Supabase) the
 * browser uploads straight to Supabase Storage using a signed URL instead.
 */
export async function PUT(request: Request) {
  if (cmsMode() !== "local") return new NextResponse("Not found", { status: 404 });

  const auth = await getAuthState();
  if (auth.status !== "admin") return new NextResponse("Please sign in again.", { status: 401 });

  const objectPath = new URL(request.url).searchParams.get("path") ?? "";
  if (!LOCAL_PATH_PATTERN.test(objectPath)) return new NextResponse("Invalid upload path.", { status: 400 });

  const kind = objectPath.startsWith("videos/") ? "video" : "image";
  const mime = (request.headers.get("content-type") ?? "").split(";")[0].trim();
  const declared = Number(request.headers.get("content-length") ?? 0);
  const problem = checkUpload(kind, mime, declared || 1);
  if (problem) return new NextResponse(problem, { status: 415 });
  if (!request.body) return new NextResponse("Empty upload.", { status: 400 });

  const destination = path.join(LOCAL_UPLOAD_DIR, objectPath);
  await mkdir(path.dirname(destination), { recursive: true });
  try {
    await stat(destination);
    return new NextResponse("This file already exists.", { status: 409 });
  } catch {
    /* not present — good */
  }

  // Count bytes while streaming so a missing or false Content-Length cannot bypass the size limit.
  let received = 0;
  const limitError = checkUpload(kind, mime, Number.MAX_SAFE_INTEGER) ?? "File too large.";
  const counted = Readable.fromWeb(request.body as unknown as WebReadableStream).on("data", (chunk: Buffer) => {
    received += chunk.length;
    if (checkUpload(kind, mime, received)) counted.destroy(new Error(limitError));
  });

  try {
    await pipeline(counted, createWriteStream(destination, { flags: "wx" }));
  } catch (e) {
    await rm(destination, { force: true });
    return new NextResponse(e instanceof Error ? e.message : "Upload failed.", { status: 413 });
  }
  return NextResponse.json({ ok: true, path: objectPath, bytes: received });
}
