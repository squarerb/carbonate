import { afterEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/rateLimit";

describe("checkRateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit, then blocks", () => {
    const key = "1.2.3.4";
    const results = Array.from({ length: 21 }, () => checkRateLimit(key));

    const allowedCount = results.filter((r) => r.allowed).length;
    const blockedCount = results.filter((r) => !r.allowed).length;

    expect(allowedCount).toBe(20);
    expect(blockedCount).toBe(1);
    expect(results[20].retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks different keys independently", () => {
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit("ip-a").allowed).toBe(true);
    }
    // ip-a is now exhausted, but a different key should be unaffected.
    expect(checkRateLimit("ip-a").allowed).toBe(false);
    expect(checkRateLimit("ip-b").allowed).toBe(true);
  });

  it("resets once the window has passed", () => {
    const key = "resetting-ip";
    vi.useFakeTimers();

    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(key).allowed).toBe(true);
    }
    expect(checkRateLimit(key).allowed).toBe(false);

    vi.setSystemTime(Date.now() + 11 * 60 * 1000); // past the 10-minute window

    expect(checkRateLimit(key).allowed).toBe(true);
  });
});
