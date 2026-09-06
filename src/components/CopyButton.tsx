"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail quietly.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border-2 border-[var(--ink)] px-3 py-1.5 text-sm hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
