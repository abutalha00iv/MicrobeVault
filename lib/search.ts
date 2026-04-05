import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cacheGet, cacheSet, redis } from "@/lib/redis";
import { SearchSuggestion } from "@/lib/types";

const SEARCH_ZSET = "microbevault:search:zset";
const POPULAR_CACHE_KEY = "microbevault:search:popular";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export async function refreshSearchIndex() {
  const [microbes, diseases, flowcharts, timelineEvents] = await Promise.all([
    db.microbe.findMany({
      select: {
        id: true,
        slug: true,
        scientificName: true,
        commonName: true,
        descriptionShort: true
      }
    }),
    db.disease.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        bodySystem: true,
        description: true
      }
    }),
    db.flowchart.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        description: true
      }
    }),
    db.timelineEvent.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        year: true
      },
      take: 128
    })
  ]);

  const suggestions: SearchSuggestion[] = [
    ...microbes.map((microbe) => ({
      id: microbe.id,
      title: microbe.scientificName,
      slug: microbe.slug,
      category: "microbe" as const,
      descriptor: microbe.commonName,
      excerpt: microbe.descriptionShort
    })),
    ...diseases.map((disease) => ({
      id: disease.id,
      title: disease.name,
      slug: disease.slug,
      category: "disease" as const,
      descriptor: disease.bodySystem,
      excerpt: disease.description.slice(0, 140)
    })),
    ...flowcharts.map((flowchart) => ({
      id: flowchart.id,
      title: flowchart.title,
      slug: flowchart.slug,
      category: "flowchart" as const,
      descriptor: flowchart.category,
      excerpt: flowchart.description.slice(0, 140)
    })),
    ...timelineEvents.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.id,
      category: "timeline" as const,
      descriptor: String(event.year),
      excerpt: event.description.slice(0, 140)
    }))
  ];

  await cacheSet(POPULAR_CACHE_KEY, suggestions.slice(0, 8), 86400);

  if (redis) {
    try {
      await redis.connect().catch(() => undefined);
      await redis.del(SEARCH_ZSET);
      if (suggestions.length) {
        const members = suggestions.flatMap((suggestion) => [0, `${normalize(suggestion.title)}::${JSON.stringify(suggestion)}`] as const);
        await (redis as any).zadd(SEARCH_ZSET, ...members);
      }
    } catch {
      // Redis is optional for local fallback.
    }
  }
}

export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const term = normalize(query);
  if (!term) {
    return [];
  }

  if (term.length === 1) {
    return (await cacheGet<SearchSuggestion[]>(POPULAR_CACHE_KEY)) || [];
  }

  if (redis) {
    try {
      await redis.connect().catch(() => undefined);
      const values = await (redis as any).zrangebylex(SEARCH_ZSET, `[${term}`, `[${term}\xff`, "LIMIT", 0, 8);
      if (values.length) {
        return values.map((entry: string) => JSON.parse(entry.split("::")[1]) as SearchSuggestion);
      }
    } catch {
      // fallback below
    }
  }

  const [microbes, diseases, flowcharts] = await Promise.all([
    db.microbe.findMany({
      where: {
        OR: [
          { scientificName: { startsWith: term, mode: "insensitive" } },
          { commonName: { startsWith: term, mode: "insensitive" } }
        ]
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        scientificName: true,
        commonName: true,
        descriptionShort: true
      }
    }),
    db.disease.findMany({
      where: {
        name: {
          startsWith: term,
          mode: "insensitive"
        }
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        name: true,
        bodySystem: true,
        description: true
      }
    }),
    db.flowchart.findMany({
      where: {
        title: {
          startsWith: term,
          mode: "insensitive"
        }
      },
      take: 2,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        description: true
      }
    })
  ]);

  return [
    ...microbes.map((microbe) => ({
      id: microbe.id,
      title: microbe.scientificName,
      slug: microbe.slug,
      category: "microbe" as const,
      descriptor: microbe.commonName,
      excerpt: microbe.descriptionShort
    })),
    ...diseases.map((disease) => ({
      id: disease.id,
      title: disease.name,
      slug: disease.slug,
      category: "disease" as const,
      descriptor: disease.bodySystem,
      excerpt: disease.description.slice(0, 140)
    })),
    ...flowcharts.map((flowchart) => ({
      id: flowchart.id,
      title: flowchart.title,
      slug: flowchart.slug,
      category: "flowchart" as const,
      descriptor: flowchart.category,
      excerpt: flowchart.description.slice(0, 140)
    }))
  ];
}

export async function searchAll(query: string) {
  const term = query.trim();

  if (!term) {
    return {
      microbes: [],
      diseases: [],
      flowcharts: [],
      timeline: []
    };
  }

  if (term.length >= 4) {
    const [microbes, diseases, flowcharts, timeline] = await Promise.all([
      db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        SELECT id, slug, scientific_name AS title, common_name AS descriptor, left(description_short, 160) AS excerpt
        FROM microbes
        WHERE to_tsvector('english', coalesce(scientific_name,'') || ' ' || coalesce(common_name,'') || ' ' || coalesce(description_short,'') || ' ' || coalesce(description_long,'')) @@ plainto_tsquery('english', ${term})
        LIMIT 20
      `),
      db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        SELECT id, slug, name AS title, body_system AS descriptor, left(description, 160) AS excerpt
        FROM diseases
        WHERE to_tsvector('english', coalesce(name,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', ${term})
        LIMIT 20
      `),
      db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        SELECT id, slug, title, category AS descriptor, left(description, 160) AS excerpt
        FROM flowcharts
        WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', ${term})
        LIMIT 20
      `),
      db.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
        SELECT id, title, left(description, 160) AS excerpt, year::text AS descriptor
        FROM timeline_events
        WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')) @@ plainto_tsquery('english', ${term})
        LIMIT 20
      `)
    ]);

    return {
      microbes: microbes.map((item) => ({ ...item, category: "microbe" })),
      diseases: diseases.map((item) => ({ ...item, category: "disease" })),
      flowcharts: flowcharts.map((item) => ({ ...item, category: "flowchart" })),
      timeline: timeline.map((item) => ({ ...item, category: "timeline" }))
    };
  }

  const suggestions = await getSearchSuggestions(term);
  return {
    microbes: suggestions.filter((item) => item.category === "microbe"),
    diseases: suggestions.filter((item) => item.category === "disease"),
    flowcharts: suggestions.filter((item) => item.category === "flowchart"),
    timeline: suggestions.filter((item) => item.category === "timeline")
  };
}
