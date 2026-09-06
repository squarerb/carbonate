import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/pastes/[id]/raw/route";
import { createPaste } from "@/lib/db";

function rawRequest(id: string) {
  return new NextRequest(`http://localhost/api/pastes/${id}/raw`);
}

describe("GET /api/pastes/[id]/raw", () => {
  it("returns plain text content for an existing paste", async () => {
    createPaste({
      id: "RAW1-TEST",
      title: null,
      content: "plain text body",
      language: "plaintext",
      expiresIn: "never",
      burnAfterRead: false,
    });

    const res = await GET(rawRequest("RAW1-TEST"), {
      params: Promise.resolve({ id: "RAW1-TEST" }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/plain");
    expect(await res.text()).toBe("plain text body");
  });

  it("returns 404 for a missing paste", async () => {
    const res = await GET(rawRequest("NOPE-0000"), {
      params: Promise.resolve({ id: "NOPE-0000" }),
    });
    expect(res.status).toBe(404);
  });

  it("consumes a burn-after-read paste on the first raw fetch", async () => {
    createPaste({
      id: "BURN-RAW1",
      title: null,
      content: "read me once",
      language: "plaintext",
      expiresIn: "never",
      burnAfterRead: true,
    });

    const first = await GET(rawRequest("BURN-RAW1"), {
      params: Promise.resolve({ id: "BURN-RAW1" }),
    });
    expect(first.status).toBe(200);

    const second = await GET(rawRequest("BURN-RAW1"), {
      params: Promise.resolve({ id: "BURN-RAW1" }),
    });
    expect(second.status).toBe(404);
  });
});
