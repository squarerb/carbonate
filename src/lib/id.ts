import { customAlphabet } from "nanoid";

// No lookalike characters (0/O, 1/I) — these get typed by hand off a receipt.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const generate = customAlphabet(alphabet, 8);

/** Formats like a register receipt / order number: 4K7B-Q2XS */
export function newPasteId(): string {
  const raw = generate();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}
