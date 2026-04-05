import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runClaudeVision } from "@/lib/anthropic";

const MAX_BASE64_BYTES = 11 * 1024 * 1024; // ~8 MB decoded

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.imageBase64 || typeof body.imageBase64 !== "string") {
      return NextResponse.json({ error: "imageBase64 is required." }, { status: 400 });
    }
    if (body.imageBase64.length > MAX_BASE64_BYTES) {
      return NextResponse.json({ error: "Image is too large. Maximum size is 8 MB." }, { status: 400 });
    }

    const shortlist = await db.microbe.findMany({
      take: 25,
      select: {
        slug: true,
        scientificName: true,
        commonName: true,
        morphology: true,
        gramStain: true,
        descriptionShort: true
      }
    });

    const mediaType = String(body.filename || "").toLowerCase().endsWith(".jpg") || String(body.filename || "").toLowerCase().endsWith(".jpeg")
      ? "image/jpeg"
      : "image/png";

    const result = await runClaudeVision(
      "You are an expert microbiologist. Analyze the microscope image, describe visible morphology, propose the top 3 likely organisms from the provided shortlist when possible, give confidence percentages, and list confirmatory tests. Return JSON with keys morphologyAnalysis, probableMatches, confirmatoryTests.",
      body.imageBase64,
      JSON.stringify({ filename: body.filename, shortlist }),
      mediaType
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json({ error: "Image analysis failed." }, { status: 500 });
  }
}
