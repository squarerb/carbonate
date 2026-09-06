import { ImageResponse } from "next/og";
import { loadSpaceMonoFonts } from "@/lib/ogFont";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e1b18",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 122,
            height: 122,
            border: "13px solid #a8402f",
            color: "#f2ecdd",
            fontSize: 88,
            fontWeight: 700,
            fontFamily: "Space Mono",
            transform: "rotate(-8deg)",
          }}
        >
          C
        </div>
      </div>
    ),
    { ...size, fonts: loadSpaceMonoFonts() }
  );
}
