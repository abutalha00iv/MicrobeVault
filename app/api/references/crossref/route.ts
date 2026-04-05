import { NextRequest, NextResponse } from "next/server";
import { fetchCrossRefByDoi } from "@/lib/references";
import { requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const doi = request.nextUrl.searchParams.get("doi");
  if (!doi) {
    return NextResponse.json({ error: "doi is required" }, { status: 400 });
  }

  try {
    const result = await fetchCrossRefByDoi(doi);
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "CrossRef lookup failed." }, { status: 500 });
  }
}
