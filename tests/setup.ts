import { beforeEach } from "vitest";

beforeEach(() => {
  // Each test gets a fresh in-memory database (":memory:" creates a brand
  // new empty database every time it's opened) and a clean rate-limit map.
  // Cast through `unknown` rather than re-declaring the global's type here,
  // since the real declarations already live alongside their modules
  // (db.ts, rateLimit.ts) and TypeScript rejects conflicting redeclarations.
  (globalThis as unknown as { __carbonateDb?: undefined }).__carbonateDb =
    undefined;
  (
    globalThis as unknown as { __carbonateRateLimit?: undefined }
  ).__carbonateRateLimit = undefined;
});
