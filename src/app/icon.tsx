import { ImageResponse } from "next/og";
import { loadSpaceMonoFonts } from "@/lib/ogFont";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
            width: 22,
            height: 22,
            border: "2.5px solid #a8402f",
            color: "#f2ecdd",
            fontSize: 16,
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
