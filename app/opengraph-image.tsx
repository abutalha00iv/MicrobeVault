import { ImageResponse } from "next/og";
import { BRAND_NAME, TAGLINE } from "@/lib/constants";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(135deg, #0A0E1A 0%, #091827 60%, #00181A 100%)",
          color: "white"
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#00F5D4" }}>{BRAND_NAME}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 74, fontWeight: 700 }}>Explore the Invisible World</div>
          <div style={{ fontSize: 32, color: "#cbd5e1" }}>{TAGLINE}</div>
        </div>
        <div style={{ fontSize: 24, color: "#FFB627" }}>Microbiology encyclopedia • AI toolkit • Clinical reference</div>
      </div>
    ),
    size
  );
}

