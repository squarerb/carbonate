import type { Metadata } from "next";
import "./globals.css";

// Falls back to localhost in dev; set NEXT_PUBLIC_SITE_URL once deployed so
// the generated OG/Twitter image URLs resolve to the real domain instead.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Carbonate — carbon copies of your text",
  description:
    "Paste text or code, get back a shareable receipt. Expiring links, burn-after-read, no account needed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center px-4 py-10 sm:py-16">
        {children}
      </body>
    </html>
  );
}
