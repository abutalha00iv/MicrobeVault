import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions, searchAll } from "@/lib/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const mode = request.nextUrl.searchParams.get("mode") || "search";

  if (mode === "suggest") {
    const suggestions = await getSearchSuggestions(query);
    return NextResponse.json({ suggestions });
  }

  const results = await searchAll(query);
  return NextResponse.json(results);
}

