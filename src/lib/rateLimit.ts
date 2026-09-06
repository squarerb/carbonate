import { NextRequest } from "next/server";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

// Modest on purpose: this should stop a spam script hammering the endpoint,
// not get in the way of someone pasting a lot of legitimate text in one sitting.
// Configurable via env vars for anyone self-hosting who wants a different balance.
const WINDOW_MINUTES = parsePositiveInt(
  process.env.CARBONATE_RATE_LIMIT_WINDOW_MINUTES,
  10
);
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = parsePositiveInt(
  process.env.CARBONATE_RATE_LIMIT_MAX_REQUESTS,
  20
);

interface Bucket {
  count: number;
  windowStart: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __carbonateRateLimit: Map<string, Bucket> | undefined;
}

function getBuckets(): Map<string, Bucket> {
  if (!global.__carbonateRateLimit) {
    global.__carbonateRateLimit = new Map();
  }
  return global.__carbonateRateLimit;
}

/** Occasional cleanup so the map doesn't grow forever on a long-running process. */
function purgeStale(buckets: Map<string, Bucket>, now: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) {
      buckets.delete(key);
    }
  }
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  // No proxy headers available (e.g. plain local dev) — treat as one shared bucket.
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const buckets = getBuckets();
  purgeStale(buckets, now);

  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil(
      (bucket.windowStart + WINDOW_MS - now) / 1000
    );
    return { allowed: false, retryAfterSeconds };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
