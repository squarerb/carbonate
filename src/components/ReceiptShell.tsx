import Link from "next/link";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="inline-block -rotate-2 select-none"
      aria-label="Carbonate home"
    >
      <span
        className="text-3xl sm:text-4xl tracking-tight text-[var(--paper)] border-4 border-[var(--paper)] px-3 py-1"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        CARBONATE
      </span>
    </Link>
  );
}

export function ReceiptShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <Wordmark />
        <p className="text-sm text-[var(--paper-dim,#cfc7ae)] opacity-70">
          carbon copies of your text, on demand
        </p>
      </div>

      <div className="w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]">
        <div className="torn-edge" />
        <div className="receipt-card px-6 py-7 sm:px-9 sm:py-9">
          {children}
        </div>
        <div className="torn-edge rotate-180" />
      </div>

      {footer && (
        <div className="mt-6 text-xs text-center opacity-80 footer-note">
          {footer}
        </div>
      )}
    </div>
  );
}

export function DottedRule() {
  return (
    <div
      className="my-5 border-t-2 border-dashed"
      style={{ borderColor: "var(--ink-faint)", opacity: 0.5 }}
    />
  );
}
