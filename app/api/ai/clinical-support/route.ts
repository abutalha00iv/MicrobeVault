import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runClaudeJson } from "@/lib/anthropic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const diseaseMatches = await db.disease.findMany({
      where: {
        OR: [
          ...(Array.isArray(body.bodySystems) ? body.bodySystems.map((system: string) => ({ bodySystem: system })) : []),
          ...(Array.isArray(body.symptoms)
            ? body.symptoms.map((symptom: string) => ({
                description: { contains: symptom, mode: "insensitive" }
              }))
            : [])
        ]
      },
      take: 20,
      include: {
        microbes: {
          include: {
            microbe: {
              select: {
                slug: true,
                scientificName: true
              }
            }
          }
        }
      }
    });

    const result = await runClaudeJson(
      "You are an expert infectious disease educator. Rank likely pathogens by likelihood, cite supporting symptoms, propose diagnostic workup, and link each candidate to a disease when present. Return JSON with a top-level pathogens array of objects containing name, slug, diseaseSlug, diseaseName, confidence, supportingSymptoms, reasoning, diagnosticWorkup.",
      {
        clinicalInput: body,
        diseaseMatches
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Clinical support error:", error);
    return NextResponse.json({ error: "Clinical support failed." }, { status: 500 });
  }
}

