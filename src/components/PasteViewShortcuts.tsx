"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShortcutsHelp } from "@/components/ShortcutsHelp";

const VIEW_SHORTCUTS = [
  { keys: ["C"], description: "Copy content" },
  { keys: ["L"], description: "Copy link" },
  { keys: ["R"], description: "Open raw" },
  { keys: ["N"], description: "New paste" },
];

export function PasteViewShortcuts({
  content,
  rawUrl,
}: {
  content: string;
  rawUrl: string;
}) {
  const router = useRouter();
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
      );
    }

    async function handleKeyDown(e: KeyboardEvent) {
      // Don't hijack browser/OS shortcuts (Cmd+C, Cmd+R, Cmd+L, etc.) or
      // interfere with typing anywhere a text field might appear.
      if (e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "c":
          e.preventDefault();
          try {
            await navigator.clipboard.writeText(content);
            setFlash("Content copied ✓");
          } catch {
            // ignore — clipboard may be unavailable
          }
          break;
        case "l":
          e.preventDefault();
          try {
            await navigator.clipboard.writeText(window.location.href);
            setFlash("Link copied ✓");
          } catch {
            // ignore
          }
          break;
        case "r":
          e.preventDefault();
          window.open(rawUrl, "_blank", "noopener,noreferrer");
          break;
        case "n":
          e.preventDefault();
          router.push("/");
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, rawUrl, router]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1400);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <>
      <ShortcutsHelp shortcuts={VIEW_SHORTCUTS} />
      {flash && (
        <div
          role="status"
          className="fixed top-16 right-4 z-50 text-xs bg-[var(--ink)] text-[var(--paper)] px-3 py-1.5"
        >
          {flash}
        </div>
      )}
    </>
  );
}
