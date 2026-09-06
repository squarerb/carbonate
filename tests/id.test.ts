import { describe, expect, it } from "vitest";
import { newPasteId } from "@/lib/id";

describe("newPasteId", () => {
  it("matches the XXXX-XXXX format using only the safe alphabet", () => {
    const id = newPasteId();
    // No 0/O or 1/I — those are excluded so a printed ID is never ambiguous.
    expect(id).toMatch(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
  });

  it("generates IDs that are effectively unique", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      ids.add(newPasteId());
    }
    // With a 32-character alphabet and 8 generated characters there are
    // 32^8 (~1.1 trillion) possibilities, so 2000 draws colliding would
    // indicate a real bug in the generator, not bad luck.
    expect(ids.size).toBe(2000);
  });
});
