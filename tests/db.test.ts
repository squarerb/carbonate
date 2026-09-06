import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPaste, readAndMaybeConsume } from "@/lib/db";

function makePaste(overrides: Partial<Parameters<typeof createPaste>[0]> = {}) {
  return createPaste({
    id: overrides.id ?? `TEST-${Math.random().toString(36).slice(2, 8)}`,
    title: overrides.title ?? null,
    content: overrides.content ?? "hello world",
    language: overrides.language ?? "plaintext",
    expiresIn: overrides.expiresIn ?? "never",
    burnAfterRead: overrides.burnAfterRead ?? false,
  });
}

describe("createPaste / readAndMaybeConsume", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and returns a paste unchanged", () => {
    const created = makePaste({ content: "console.log(1)", language: "javascript" });
    const fetched = readAndMaybeConsume(created.id);

    expect(fetched).not.toBeNull();
    expect(fetched?.content).toBe("console.log(1)");
    expect(fetched?.language).toBe("javascript");
    expect(fetched?.burnAfterRead).toBe(false);
  });

  it("returns null for an ID that was never created", () => {
    expect(readAndMaybeConsume("NOPE-0000")).toBeNull();
  });

  it("a never-expiring paste survives an arbitrary amount of time", () => {
    const created = makePaste({ expiresIn: "never" });
    expect(created.expiresAt).toBeNull();

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 365 * 24 * 60 * 60 * 1000); // +1 year

    expect(readAndMaybeConsume(created.id)).not.toBeNull();
  });

  it("an expired paste is treated as missing and gets purged", () => {
    const created = makePaste({ expiresIn: "1h" });

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000); // +2 hours, past the 1h expiry

    expect(readAndMaybeConsume(created.id)).toBeNull();
  });

  it("a burn-after-read paste is readable exactly once", () => {
    const created = makePaste({ content: "burn me", burnAfterRead: true });

    const firstRead = readAndMaybeConsume(created.id);
    expect(firstRead?.content).toBe("burn me");

    const secondRead = readAndMaybeConsume(created.id);
    expect(secondRead).toBeNull();
  });

  it("a normal (non-burn) paste can be read multiple times", () => {
    const created = makePaste({ burnAfterRead: false });

    expect(readAndMaybeConsume(created.id)).not.toBeNull();
    expect(readAndMaybeConsume(created.id)).not.toBeNull();
  });
});
