import { ReceiptShell } from "@/components/ReceiptShell";

export default function NotFound() {
  return (
    <ReceiptShell>
      <div className="text-center py-6">
        <p
          className="text-2xl -rotate-6 inline-block border-4 border-[var(--carbon-blue)] text-[var(--carbon-blue)] px-4 py-1 mb-4"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          404
        </p>
        <p className="text-sm text-[var(--ink-faint)]">
          Nothing&apos;s filed under this number. The page you&apos;re
          looking for doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="inline-block mt-5 border-2 border-[var(--ink)] px-4 py-2 text-sm hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
        >
          Back to the counter
        </a>
      </div>
    </ReceiptShell>
  );
}
