import { cacheGet, cacheSet } from "@/lib/redis";

const ncbiRequests: number[] = [];

async function enforceRateLimit() {
  const max = process.env.NCBI_API_KEY ? 10 : 3;
  const windowMs = 1000;
  const now = Date.now();

  while (ncbiRequests.length && now - ncbiRequests[0] > windowMs) {
    ncbiRequests.shift();
  }

  if (ncbiRequests.length >= max) {
    const waitFor = windowMs - (now - ncbiRequests[0]);
    await new Promise((resolve) => setTimeout(resolve, Math.max(waitFor, 100)));
  }

  ncbiRequests.push(Date.now());
}

async function ncbiFetch(path: string, params: Record<string, string>) {
  await enforceRateLimit();
  const url = new URL(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/${path}`);
  Object.entries({
    retmode: "json",
    tool: "microbevault",
    email: "support@microbevault.app",
    api_key: process.env.NCBI_API_KEY || "",
    ...params
  }).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 }
  });

  if (!response.ok) {
    throw new Error(`NCBI request failed with status ${response.status}`);
  }

  return response.text();
}

function extractPubMedAbstracts(xml: string) {
  const articles = [...xml.matchAll(/<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g)].slice(0, 3);

  return articles.map((entry) => {
    const block = entry[1];
    const pmid = block.match(/<PMID[^>]*>(.*?)<\/PMID>/)?.[1] || "";
    const title = block.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1]?.replace(/<[^>]+>/g, "") || "Untitled";
    const abstract = block
      .match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/)?.[1]
      ?.replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim() || "Abstract unavailable.";

    return { pmid, title, abstract };
  });
}

type NcbiBundle = {
  taxonomyId: number;
  officialName: string;
  taxonomyJson: Record<string, unknown>;
  genbankCount: number;
  pubmedCount: number;
  sequenceSummary: string;
  pubmedAbstracts: { pmid: string; title: string; abstract: string }[];
};

export async function fetchNcbiBundle(options: { term?: string; taxonomyId?: number }): Promise<NcbiBundle> {
  const cacheKey = `ncbi:${JSON.stringify(options)}`;
  const cached = await cacheGet<NcbiBundle>(cacheKey);
  if (cached) {
    return cached;
  }

  let taxonomyId = options.taxonomyId;
  let officialName = options.term || "";

  if (!taxonomyId && options.term) {
    const searchJson = JSON.parse(await ncbiFetch("esearch.fcgi", { db: "taxonomy", term: options.term }));
    taxonomyId = Number(searchJson.esearchresult?.idlist?.[0] || 0) || undefined;
  }

  if (!taxonomyId) {
    throw new Error("No taxonomy record found in NCBI.");
  }

  const taxonomySummaryJson = JSON.parse(await ncbiFetch("esummary.fcgi", { db: "taxonomy", id: String(taxonomyId) }));
  const taxonomySummary = taxonomySummaryJson.result?.[taxonomyId] || {};
  officialName = taxonomySummary.scientificname || officialName;

  const [genbankSearchJson, pubmedSearchJson] = await Promise.all([
    JSON.parse(await ncbiFetch("esearch.fcgi", { db: "nucleotide", term: `txid${taxonomyId}[Organism:exp]`, retmax: "0" })),
    JSON.parse(await ncbiFetch("esearch.fcgi", { db: "pubmed", term: officialName, retmax: "3" }))
  ]);

  const pubmedIds = pubmedSearchJson.esearchresult?.idlist || [];
  const abstractXml = pubmedIds.length
    ? await ncbiFetch("efetch.fcgi", { db: "pubmed", id: pubmedIds.join(","), retmode: "xml" })
    : "";

  const result = {
    taxonomyId,
    officialName,
    taxonomyJson: taxonomySummary,
    genbankCount: Number(genbankSearchJson.esearchresult?.count || 0),
    pubmedCount: Number(pubmedSearchJson.esearchresult?.count || 0),
    sequenceSummary:
      taxonomySummary.commonname
        ? `${taxonomySummary.scientificname} is catalogued in NCBI Taxonomy with common name ${taxonomySummary.commonname}.`
        : `${taxonomySummary.scientificname || officialName} has searchable sequence records in GenBank.`,
    pubmedAbstracts: abstractXml ? extractPubMedAbstracts(abstractXml) : []
  };

  await cacheSet(cacheKey, result, 86400);
  return result;
}

