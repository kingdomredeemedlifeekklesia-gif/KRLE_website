import { NextResponse } from "next/server";

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function normalizeOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, "");
  }
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}

function getAllowedOrigins() {
  const configured = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.APP_URL,
    process.env.SITE_URL,
  ].filter(Boolean) as string[];

  return [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    ...configured,
  ].map((value) => normalizeOrigin(value));
}

export function isSameOriginRequest(request: Request) {
  const origin = normalizeOrigin(request.headers.get("origin"));
  const referer = normalizeOrigin(request.headers.get("referer"));
  const secFetchSite = request.headers.get("sec-fetch-site");
  const host = request.headers.get("host") || "";
  const allowedOrigins = getAllowedOrigins();

  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return true;
  }

  if (origin && allowedOrigins.some((allowed) => allowed && origin === allowed)) {
    return true;
  }

  if (referer && allowedOrigins.some((allowed) => allowed && referer === allowed)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production" && (host.startsWith("localhost") || host.startsWith("127.0.0.1"))) {
    return true;
  }

  return false;
}

export function enforceRateLimit(request: Request, options?: { limit?: number; windowMs?: number }) {
  const limit = options?.limit ?? 12;
  const windowMs = options?.windowMs ?? 60_000;
  const key = getClientIp(request);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function tooManyRequestsResponse(message = "Too many requests") {
  return NextResponse.json({ error: message }, { status: 429 });
}
