import "server-only";
import { cacheGet, cacheSet } from "@/lib/redis";

export async function fetchCrossRefByDoi(doi: string) {
  const normalized = doi.trim().toLowerCase();
  const cacheKey = `crossref:${normalized}`;
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(normalized)}`, {
    next: { revalidate: 86400 }
  });

  if (!response.ok) {
    throw new Error("CrossRef lookup failed.");
  }

  const json = await response.json();
  const message = json.message;
  const data = {
    title: message.title?.[0] || normalized,
    authors:
      message.author?.map((author: { family?: string; given?: string }) => `${author.family || ""}, ${author.given || ""}`.trim()).join("; ") || "",
    journalOrPublisher: message["container-title"]?.[0] || message.publisher || "",
    year: message.issued?.["date-parts"]?.[0]?.[0] || null,
    volume: message.volume || null,
    issue: message.issue || null,
    pages: message.page || null,
    doi: message.DOI || normalized,
    url: message.URL || null
  };

  await cacheSet(cacheKey, data, 86400);
  return data;
}

export function toBibTeX(reference: {
  id: string;
  title: string;
  authors?: string | null;
  year?: number | null;
  journalOrPublisher?: string | null;
  doi?: string | null;
  url?: string | null;
}) {
  const key = reference.title.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return `@article{${key},
  title = {${reference.title}},
  author = {${reference.authors || "Unknown"}},
  journal = {${reference.journalOrPublisher || "Unknown"}},
  year = {${reference.year || ""}},
  doi = {${reference.doi || ""}},
  url = {${reference.url || ""}}
}`;
}
