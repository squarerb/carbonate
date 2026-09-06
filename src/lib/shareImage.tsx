import { ImageResponse } from "next/og";
import { loadSpaceMonoFonts } from "@/lib/ogFont";

export function renderShareImage() {
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
            flexDirection: "column",
            alignItems: "center",
            background: "#f2ecdd",
            padding: "72px 110px",
            boxShadow: "0 40px 90px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 700,
              color: "#a8402f",
              border: "6px solid #a8402f",
              padding: "16px 40px",
              letterSpacing: 6,
              transform: "rotate(-3deg)",
              fontFamily: "Space Mono",
            }}
          >
            CARBONATE
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 30,
              color: "#2a2622",
              fontFamily: "Space Mono",
            }}
          >
            carbon copies of your text, on demand
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 48,
              paddingTop: 32,
              borderTop: "3px dashed #8c8577",
              width: "100%",
              justifyContent: "space-between",
              fontSize: 22,
              color: "#8c8577",
              fontFamily: "Space Mono",
            }}
          >
            <div style={{ display: "flex" }}>NO. 7K2B-QX9F</div>
            <div style={{ display: "flex" }}>paste &gt; share &gt; expire</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: loadSpaceMonoFonts() }
  );
}
