import { NextResponse } from "next/server";
import { validateEnquiry } from "@/lib/enquiry";

/**
 * Receives enquiries from the contact form.
 *
 * Delivery is intentionally pluggable: set ENQUIRY_WEBHOOK_URL to any endpoint
 * that accepts a JSON POST (Formspree, Make/Zapier, a Slack or Google Apps
 * Script webhook, or your own mail service). Until it is set, the route
 * answers 503 and the form asks visitors to call the studio instead — no
 * enquiry is ever silently dropped.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const { data, errors } = validateEnquiry(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, error: "invalid", errors }, { status: 422 });
  }

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, source: "website", receivedAt: new Date().toISOString() }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
  } catch (err) {
    console.error("[enquiry] delivery failed", err);
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
