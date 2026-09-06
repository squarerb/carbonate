import fs from "node:fs";
import path from "node:path";

const FONT_DIR = path.join(
  process.cwd(),
  "node_modules/@fontsource/space-mono/files"
);

export function loadSpaceMonoFonts() {
  const regular = fs.readFileSync(
    path.join(FONT_DIR, "space-mono-latin-400-normal.woff")
  );
  const bold = fs.readFileSync(
    path.join(FONT_DIR, "space-mono-latin-700-normal.woff")
  );

  return [
    { name: "Space Mono", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Space Mono", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}
