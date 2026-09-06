const DEFAULT_MAX_CONTENT_BYTES = 512 * 1024; // 512KB — plenty for text/code, keeps sqlite happy

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

// Configurable via NEXT_PUBLIC_MAX_CONTENT_BYTES so it's baked into the client
// bundle at build time — this constant is shared by the client-side byte
// counter (PasteForm) and the server-side check (the API route), and both
// need to agree on the same number without a network round trip.
export const MAX_CONTENT_BYTES = parsePositiveInt(
  process.env.NEXT_PUBLIC_MAX_CONTENT_BYTES,
  DEFAULT_MAX_CONTENT_BYTES
);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

