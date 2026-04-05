import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { BRAND_NAME } from "@/lib/constants";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function MicrobeOgImage({ params }: { params: { slug: string } }) {
  const microbe = await db.microbe.findUnique({
    where: { slug: params.slug },
    select: {
      scientificName: true,
      commonName: true,
      kingdomLabel: true,
      descriptionShort: true
    }
  });

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
          background: "linear-gradient(135deg, #0A0E1A 0%, #04151A 50%, #0B1025 100%)",
          color: "white"
        }}
      >
        <div style={{ fontSize: 28, color: "#00F5D4", letterSpacing: 8 }}>{BRAND_NAME}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontStyle: "italic", fontWeight: 700 }}>{microbe?.scientificName || "MicrobeVault"}</div>
          <div style={{ fontSize: 30 }}>{microbe?.commonName || "Microbiology profile"}</div>
          <div style={{ fontSize: 24, color: "#cbd5e1", maxWidth: 1000 }}>{microbe?.descriptionShort || "Explore a deeply referenced organism profile in MicrobeVault."}</div>
        </div>
        <div style={{ fontSize: 24, color: "#FFB627" }}>{microbe?.kingdomLabel || "Microbe profile"}</div>
      </div>
    ),
    size
  );
}

