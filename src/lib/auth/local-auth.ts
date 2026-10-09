import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sign-in for the LOCAL PREVIEW mode only (CMS_LOCAL_MODE=true, never on
 * Vercel). The password lives in a server-side environment variable; the
 * browser receives an httpOnly, HMAC-signed session cookie. Production uses
 * Supabase Auth instead — see src/lib/auth/session.ts.
 */

export const LOCAL_SESSION_COOKIE = "rsd_local_admin";
export const LOCAL_SESSION_HOURS = 12;
export const LOCAL_ADMIN_EMAIL = "local-admin";

const password = () => process.env.LOCAL_ADMIN_PASSWORD ?? "";

function secret() {
  return process.env.LOCAL_ADMIN_SECRET || createHash("sha256").update(`${password()}:rsd-local-session`).digest("hex");
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function localAuthConfigured() {
  return password().length >= 8;
}

export function verifyLocalPassword(candidate: string) {
  return localAuthConfigured() && safeEqual(candidate, password());
}

export function createLocalSessionToken(now = Date.now()) {
  const expires = now + LOCAL_SESSION_HOURS * 3600 * 1000;
  const payload = `admin:${expires}`;
  return { token: `${expires}.${sign(payload)}`, expires: new Date(expires) };
}

export function verifyLocalSessionToken(token: string | undefined, now = Date.now()) {
  if (!token || !localAuthConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < now) return false;
  return safeEqual(signature, sign(`admin:${expires}`));
}
