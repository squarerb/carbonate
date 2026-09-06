import hljs from "highlight.js";
import { readAndMaybeConsume } from "@/lib/db";
import { languageLabel } from "@/lib/languages";
import { ReceiptShell, DottedRule } from "@/components/ReceiptShell";
import { CopyButton } from "@/components/CopyButton";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PasteViewShortcuts } from "@/components/PasteViewShortcuts";

function formatTimestamp(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function highlight(content: string, language: string | null): string {
  if (language && language !== "plaintext" && hljs.getLanguage(language)) {
    return hljs.highlight(content, { language }).value;
  }
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped;
}

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paste = readAndMaybeConsume(id);

  if (!paste) {
    return (
      <ReceiptShell>
        <div className="text-center py-6">
          <p
            className="text-2xl -rotate-6 inline-block border-4 border-[var(--stamp-red)] text-[var(--stamp-red)] px-4 py-1 mb-4"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            VOID
          </p>
          <p className="text-sm text-[var(--ink-faint)]">
            This slip doesn&apos;t exist anymore — it either expired or was
            already read once and destroyed.
          </p>
          <a
            href="/"
            className="inline-block mt-5 border-2 border-[var(--ink)] px-4 py-2 text-sm hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            Print a new one
          </a>
        </div>
      </ReceiptShell>
    );
  }

  const expiryLine = paste.burnAfterRead
    ? "single read — this copy is now destroyed"
    : paste.expiresAt
      ? `valid until ${formatTimestamp(paste.expiresAt)}`
      : "does not expire";

  const highlighted = highlight(paste.content, paste.language);
  const lineCount = paste.content.split("\n").length;
  const rawUrl = `/api/pastes/${paste.id}/raw`;

  return (
    <ReceiptShell
      footer={
        <a href="/" className="underline underline-offset-2">
          Print a new one
        </a>
      }
    >
      <PasteViewShortcuts content={paste.content} rawUrl={rawUrl} />
      <div className="text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[var(--ink-faint)]">No.</span>
          <span className="font-bold tracking-wide">{paste.id}</span>
        </div>
        {paste.title && (
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-[var(--ink-faint)]">label</span>
            <span className="text-right">{paste.title}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[var(--ink-faint)]">printed</span>
          <span>{formatTimestamp(paste.createdAt)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[var(--ink-faint)]">lang</span>
          <span>{languageLabel(paste.language)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[var(--ink-faint)]">status</span>
          <span
            className={
              paste.burnAfterRead ? "text-[var(--stamp-red)]" : undefined
            }
          >
            {expiryLine}
          </span>
        </div>
      </div>

      <DottedRule />

      <pre
        tabIndex={0}
        aria-label="Paste content"
        className="overflow-x-auto text-xs sm:text-sm leading-relaxed bg-[var(--paper-dim)] p-3 border border-[var(--ink)]/20"
      >
        <code
          className="hljs"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>

      <DottedRule />

      <div className="flex items-center justify-between gap-3 text-xs text-[var(--ink-faint)] flex-wrap">
        <span>{lineCount} lines</span>
        <div className="flex gap-2 flex-wrap">
          <CopyLinkButton />
          <CopyButton text={paste.content} />
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-[var(--ink)] px-3 py-1.5 text-sm hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            Raw
          </a>
        </div>
      </div>
    </ReceiptShell>
  );
}
