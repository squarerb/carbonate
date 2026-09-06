import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/pastes/route";
import { readAndMaybeConsume } from "@/lib/db";
import { MAX_CONTENT_BYTES } from "@/lib/constants";

function postRequest(body: unknown) {
  return new NextRequest("http://localhost/api/pastes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/pastes", () => {
  it("rejects empty content", async () => {
    const res = await POST(postRequest({ content: "   " }));
    expect(res.status).toBe(400);
  });

  it("rejects content over the size cap", async () => {
    const res = await POST(
      postRequest({ content: "a".repeat(MAX_CONTENT_BYTES + 1) })
    );
    expect(res.status).toBe(413);
  });

  it("creates a paste and returns its ID", async () => {
    const res = await POST(postRequest({ content: "hello from a test" }));
    expect(res.status).toBe(201);

    const { id } = await res.json();
    expect(id).toMatch(/^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);

    const stored = readAndMaybeConsume(id);
    expect(stored?.content).toBe("hello from a test");
  });

  it("falls back to safe defaults for invalid language/expiry", async () => {
    const res = await POST(
      postRequest({
        content: "test",
        language: "not-a-real-language",
        expiresIn: "not-a-real-option",
      })
    );
    const { id } = await res.json();
    const stored = readAndMaybeConsume(id);

    expect(stored?.language).toBe("plaintext");
    expect(stored?.expiresAt).not.toBeNull(); // default expiry ("1w") is not "never"
  });

  it("respects an explicit burnAfterRead flag", async () => {
    const res = await POST(
      postRequest({ content: "one time only", burnAfterRead: true })
    );
    const { id } = await res.json();

    expect(readAndMaybeConsume(id)?.content).toBe("one time only");
    expect(readAndMaybeConsume(id)).toBeNull(); // consumed by the read above
  });

  it("stops accepting requests once the rate limit is hit", async () => {
    let lastStatus = 0;
    for (let i = 0; i < 21; i++) {
      const res = await POST(postRequest({ content: `paste ${i}` }));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
