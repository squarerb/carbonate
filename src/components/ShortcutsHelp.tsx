"use client";

import { useEffect, useRef, useState } from "react";

export interface Shortcut {
  keys: string[];
  description: string;
}

export function ShortcutsHelp({ shortcuts }: { shortcuts: Shortcut[] }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="fixed top-4 right-4 z-50 text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="text-xs border border-dashed border-[var(--paper-dim)]/50 text-[var(--paper-dim)] px-2.5 py-1.5 hover:border-[var(--paper-dim)] hover:text-[var(--paper)] transition-colors bg-[var(--desk)]"
      >
        <span aria-hidden="true">⌨</span> Shortcuts
      </button>

      {open && (
        <div
          role="menu"
          className="mt-2 w-60 receipt-card border border-[var(--ink)]/20 p-3 shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
        >
          <ul className="flex flex-col gap-2">
            {shortcuts.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[var(--ink)]">{s.description}</span>
                <span className="flex gap-1 shrink-0">
                  {s.keys.map((k, j) => (
                    <kbd
                      key={j}
                      className="border border-[var(--ink)]/40 bg-[var(--paper-dim)] px-1.5 py-0.5 text-[10px] leading-none"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
