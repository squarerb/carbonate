# Carbonate

[![CI](https://github.com/squarerb/carbonate/actions/workflows/ci.yml/badge.svg)](https://github.com/squarerb/carbonate/actions/workflows/ci.yml)

A minimal pastebin: paste text or code, get back a shareable link. No account required.

Themed like a receipt printer, every paste is a torn-off "slip" with an order number, a print timestamp, and (optionally) an expiry stamp.

<div align="center">
  <img src="https://github.com/user-attachments/assets/979f2e3c-daf3-461b-a257-8e63632f03c3" height="300" alt="Visual overview of the create page" />
  <img src="https://github.com/user-attachments/assets/49e230eb-b145-4c9d-a8b9-a818574f9593" height="300" alt="Visual overview of the receipt page" />
  <p><sub>Figure: Create page and Receipt page</sub></p>
</div>

**Features**
- Share text/code snippets via a short link (`/p/ABCD-1234`)
- Syntax highlighting for ~20 common languages
- Expiring links (1 hour / 1 day / 1 week / 1 month / never)
- Burn-after-read, the paste is deleted the moment it's viewed once
- Raw text view (`/p/ABCD-1234` → `/api/pastes/ABCD-1234/raw`)
- Keyboard shortcuts (⌘/Ctrl+Enter to print, C/L/R/N to copy/copy-link/raw/new on the view page), a "⌨ Shortcuts" badge in the corner shows what's available
- Themed 404 page for anything that doesn't match a route
- Custom favicon, Apple touch icon, and Open Graph/Twitter share image, all generated with `next/og`, no external design tool or image assets needed
- No external database service, no API keys, nothing to configure

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- SQLite via Node's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html) module, no native bindings to compile, no external engine binaries to download
- [highlight.js](https://highlightjs.org) for syntax highlighting (rendered server-side)
- Self-hosted fonts via [Fontsource](https://fontsource.org) (Space Mono + Special Elite), no calls out to Google Fonts at build time

Requires **Node.js 22.5+** (for `node:sqlite`; it's marked experimental by Node but is stable enough for a project like this — see [caveats](#caveats) below).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A SQLite database is created automatically at `data/carbonate.db` on first run, nothing else to set up.

To run a production build locally:

```bash
npm run build
npm start
```

## Testing

```bash
npm test          # run once
npm run test:watch # watch mode
```

The suite (Vitest) covers paste creation, expiry, burn-after-read, the ID generator's format and uniqueness, the rate limiter's window/reset behavior, and the API route handlers directly (`POST /api/pastes`, `GET /api/pastes/[id]/raw`) — validation, defaults, and status codes, without needing a running server. Tests run against an isolated in-memory SQLite database (`CARBONATE_DB_PATH=":memory:"`, set in `vitest.config.mts`) so they never touch `data/carbonate.db`.

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `npm test` and `npm run build` on every push and pull request to `main`.

## Project structure

```
src/
  app/
    page.tsx                     # create-paste form
    p/[id]/page.tsx              # view a paste
    not-found.tsx                # themed 404
    icon.tsx / apple-icon.tsx    # generated favicon + touch icon
    opengraph-image.tsx          # generated OG/Twitter share image
    api/pastes/route.ts          # POST — create a paste
    api/pastes/[id]/raw/route.ts # GET  — raw text of a paste
  components/
    PasteForm.tsx                # the create form (client component)
    ReceiptShell.tsx             # shared receipt-card chrome
    CopyButton.tsx / CopyLinkButton.tsx
    ShortcutsHelp.tsx            # keyboard-shortcuts popover badge
    PasteViewShortcuts.tsx       # key bindings for the view page
  lib/
    db.ts                        # SQLite access
    id.ts                        # receipt-style ID generator
    languages.ts                 # supported language list
    rateLimit.ts                 # in-memory per-IP rate limiter
    constants.ts                 # shared size limit + byte formatting
    ogFont.ts / shareImage.tsx   # font loading + JSX for the OG image
tests/
  *.test.ts                     # Vitest suite (see Testing above)
  setup.ts                      # resets DB/rate-limit state between tests
```

## Deploying

Optionally copy `.env.example` to `.env` and set `NEXT_PUBLIC_SITE_URL` to your deployed domain, this makes the generated Open Graph/Twitter share images resolve to the right URL instead of `localhost`. It's not required for the app to work, only for link previews to point at the right host.

The app works anywhere that runs a persistent Node.js process (Docker, Railway, Render, a small VPS, Fly.io, etc.) — the SQLite file just needs a writable, persistent disk.

**A note on serverless platforms (e.g. Vercel):** serverless functions don't guarantee a persistent filesystem between invocations, so the SQLite file won't reliably survive across requests there. If you want to deploy to a serverless platform, swap `src/lib/db.ts` for a hosted database instead, a good low-effort option is [Turso](https://turso.tech) (SQLite-compatible, generous free tier) or Vercel Postgres. The rest of the app doesn't need to change, since all database access already goes through the small set of functions in `db.ts`.

## Caveats

- `node:sqlite` is still flagged experimental by Node.js; it's used here because it needs zero extra dependencies and no binary downloads, but for a production/serverless deployment consider swapping in `better-sqlite3` or a hosted database as noted above.
- Pastes are capped at 512KB to keep things snappy, configurable via `NEXT_PUBLIC_MAX_CONTENT_BYTES` (see `.env.example`) without touching code.
- There's no auth. Paste creation is rate-limited to 20 per 10 minutes per IP by default — also configurable via `CARBONATE_RATE_LIMIT_WINDOW_MINUTES` / `CARBONATE_RATE_LIMIT_MAX_REQUESTS` (see `.env.example`). It's a modest, in-memory limiter (`src/lib/rateLimit.ts`) meant to deter spam scripts without getting in the way of someone pasting a lot of legitimate text in one sitting. It resets if the process restarts and doesn't share state across multiple instances, swap in something like Upstash's rate limiter if you deploy behind a load balancer with several instances.

## License

MIT
