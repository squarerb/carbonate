import { describe, expect, it } from "vitest";
import { formatBytes } from "@/lib/constants";

describe("formatBytes", () => {
  it("formats sub-1KB values in bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats 1KB and above in KB with one decimal place", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(512 * 1024)).toBe("512.0 KB");
  });
});
