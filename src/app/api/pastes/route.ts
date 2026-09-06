import { NextRequest, NextResponse } from "next/server";
import { createPaste, type ExpiryOption } from "@/lib/db";
import { newPasteId } from "@/lib/id";
import { LANGUAGES } from "@/lib/languages";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { MAX_CONTENT_BYTES, formatBytes } from "@/lib/constants";

const VALID_EXPIRY: ExpiryOption[] = ["never", "1h", "1d", "1w", "1m"];
const VALID_LANGUAGES = new Set(LANGUAGES.map((l) => l.value));

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Slow down — too many slips printed from here recently. Try again shortly.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  let body: {
    content?: unknown;
    title?: unknown;
    language?: unknown;
    expiresIn?: unknown;
    burnAfterRead?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content : "";
  if (!content.trim()) {
    return NextResponse.json(
      { error: "There's nothing to print — paste some text first." },
      { status: 400 }
    );
  }
  if (Buffer.byteLength(content, "utf8") > MAX_CONTENT_BYTES) {
    return NextResponse.json(
      { error: `That's too long for one slip (${formatBytes(MAX_CONTENT_BYTES)} max).` },
      { status: 413 }
    );
  }

  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 120)
      : null;

  const language =
    typeof body.language === "string" && VALID_LANGUAGES.has(body.language as never)
      ? body.language
      : "plaintext";

  const expiresIn: ExpiryOption =
    typeof body.expiresIn === "string" &&
    VALID_EXPIRY.includes(body.expiresIn as ExpiryOption)
      ? (body.expiresIn as ExpiryOption)
      : "1w";

  const burnAfterRead = body.burnAfterRead === true;

  const id = newPasteId();

  const paste = createPaste({
    id,
    title,
    content,
    language,
    expiresIn,
    burnAfterRead,
  });

  return NextResponse.json({ id: paste.id }, { status: 201 });
}
