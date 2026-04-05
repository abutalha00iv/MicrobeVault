import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { runClaudeJson } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const where = {
      AND: [
        body.gramStain && body.gramStain !== "unknown" ? { gramStain: body.gramStain } : {},
        body.morphology && body.morphology !== "unknown" ? { morphology: body.morphology } : {},
        body.oxygenRequirement && body.oxygenRequirement !== "unknown" ? { oxygenRequirement: body.oxygenRequirement } : {},
        body.motility && body.motility !== "unknown" ? { motility: body.motility === "yes" } : {},
        body.sporeForming && body.sporeForming !== "unknown" ? { sporeForming: body.sporeForming === "yes" } : {},
        body.habitat && body.habitat !== "unknown" ? { habitat: { contains: body.habitat, mode: Prisma.QueryMode.insensitive } } : {}
      ]
    };

    const exactMatches = await db.microbe.findMany({
      where,
      take: 12,
      select: {
        slug: true,
        scientificName: true,
        commonName: true,
        gramStain: true,
        morphology: true,
        oxygenRequirement: true,
        motility: true,
        sporeForming: true,
        habitat: true,
        diseases: {
          include: {
            disease: {
              select: { name: true }
            }
          }
        }
      }
    });

    const ai = await runClaudeJson(
      "You are an expert microbiologist. Match structured traits to candidate microbes from the provided database shortlist and explain your reasoning. Output JSON with a top-level key candidates containing up to 5 objects with keys name, slug, score, reasoning.",
      {
        observedTraits: body,
        exactMatches
      }
    );

    return NextResponse.json({
      candidates: ai.candidates || []
    });
  } catch (error) {
    console.error("Trait identification error:", error);
    return NextResponse.json({ error: "Trait identification failed." }, { status: 500 });
  }
}

