"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGES } from "@/lib/languages";
import { MAX_CONTENT_BYTES, formatBytes } from "@/lib/constants";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";

const HOME_SHORTCUTS = [
  { keys: ["⌘/Ctrl", "Enter"], description: "Print receipt" },
];

export function PasteForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("plaintext");
  const [expiresIn, setExpiresIn] = useState("1w");
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byteCount = useMemo(
    () => new TextEncoder().encode(content).length,
    [content]
  );
  const overLimit = byteCount > MAX_CONTENT_BYTES;
  const nearLimit = !overLimit && byteCount > MAX_CONTENT_BYTES * 0.9;

  async function submitPaste() {
    if (!content.trim()) {
      setError("There's nothing to print — paste some text first.");
      return;
    }
    if (overLimit) {
      setError(
        `That's too long for one slip (${formatBytes(MAX_CONTENT_BYTES)} max).`
      );
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title: title.trim() || null,
          language,
          expiresIn,
          burnAfterRead,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Couldn't print that receipt.");
      }
      const { id } = await res.json();
      router.push(`/p/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitPaste();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (!submitting) submitPaste();
    }
  }

  return (
    <>
      <ShortcutsHelp shortcuts={HOME_SHORTCUTS} />
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex flex-col gap-4">
      <label htmlFor="paste-title" className="sr-only">
        Label this slip (optional)
      </label>
      <input
        id="paste-title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Label this slip (optional)"
        maxLength={120}
        className="bg-transparent border-b-2 border-[var(--ink)]/30 pb-1 text-sm placeholder:text-[var(--ink-faint)] focus:border-[var(--carbon-blue)]"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="paste-content" className="sr-only">
          Text or code to paste
        </label>
        <textarea
          id="paste-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your text or code here…"
          rows={12}
          className="bg-[var(--paper-dim)] border border-[var(--ink)]/20 p-3 text-sm leading-relaxed resize-y placeholder:text-[var(--ink-faint)]"
          autoFocus
        />
        <span
          className="self-end text-xs"
          style={{
            color: overLimit
              ? "var(--stamp-red)"
              : nearLimit
                ? "#7a5230"
                : "var(--ink-faint)",
          }}
        >
          {formatBytes(byteCount)} / {formatBytes(MAX_CONTENT_BYTES)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-[var(--ink-faint)]">Language</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-b-2 border-[var(--ink)]/30 pb-1 focus:border-[var(--carbon-blue)]"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[var(--ink-faint)]">Expires</span>
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            className="bg-transparent border-b-2 border-[var(--ink)]/30 pb-1 focus:border-[var(--carbon-blue)]"
          >
            <option value="1h">In 1 hour</option>
            <option value="1d">In 1 day</option>
            <option value="1w">In 1 week</option>
            <option value="1m">In 1 month</option>
            <option value="never">Never</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={burnAfterRead}
          onChange={(e) => setBurnAfterRead(e.target.checked)}
          className="accent-[var(--stamp-red)]"
        />
        Destroy after first read
      </label>

      {error && (
        <p className="text-sm text-[var(--stamp-red)]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || overLimit}
        className="mt-2 bg-[var(--stamp-red)] text-[var(--paper)] py-2.5 font-bold tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? "Printing…" : "Print Receipt"}
      </button>
    </form>
    </>
  );
}
