import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { cacheGet, cacheSet } from "@/lib/redis";
import { TaxonomyNode } from "@/lib/types";
import { slugify } from "@/lib/utils";

function serializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function withCache<T>(key: string, ttlSeconds: number, loader: () => Promise<T>) {
  const cached = await cacheGet<T>(key);
  if (cached) {
    return cached;
  }

  const result = await loader();
  const serialized = serializable(result);
  await cacheSet(key, serialized, ttlSeconds);
  return serialized;
}

function buildTaxonomyTree(rows: Array<Record<string, string | null>>): TaxonomyNode[] {
  const levels = ["kingdom", "phylum", "taxClass", "order", "family", "genus"] as const;

  const createNode = (label: string, level: string): TaxonomyNode => ({ label, level, count: 0, children: [] });
  const roots: TaxonomyNode[] = [];

  rows.forEach((row) => {
    let currentLevelNodes = roots;

    levels.forEach((levelName) => {
      const value = row[levelName];
      if (!value) return;

      let currentNode = currentLevelNodes.find((candidate) => candidate.label === value && candidate.level === levelName);
      if (!currentNode) {
        currentNode = createNode(value, levelName);
        currentLevelNodes.push(currentNode);
      }

      currentNode.count = (currentNode.count || 0) + 1;
      currentLevelNodes = currentNode.children ||= [];
    });
  });

  return roots.sort((a, b) => a.label.localeCompare(b.label));
}

export async function getSiteStats() {
  return withCache("stats:site", 3600, async () => {
    const [microbes, diseases, kingdoms, discovery] = await Promise.all([
      db.microbe.count(),
      db.disease.count(),
      db.microbe.findMany({ select: { kingdomLabel: true }, distinct: ["kingdomLabel"] }),
      db.microbe.aggregate({ _min: { discoveryYear: true }, _max: { discoveryYear: true } })
    ]);

    const min = discovery._min.discoveryYear ?? new Date().getFullYear();
    const max = discovery._max.discoveryYear ?? new Date().getFullYear();

    return {
      microbes,
      diseases,
      kingdoms: kingdoms.filter((item) => item.kingdomLabel).length,
      yearsCovered: Math.max(max - min, 1)
    };
  });
}

export async function getHomepageData() {
  return withCache("page:home", 3600, async () => {
    const [stats, featuredMicrobes, latestMicrobes, factSources] = await Promise.all([
      getSiteStats(),
      db.microbe.findMany({
        take: 6,
        orderBy: [{ isDangerous: "desc" }, { isBeneficial: "desc" }, { createdAt: "desc" }],
        select: {
          slug: true,
          commonName: true,
          scientificName: true,
          descriptionShort: true,
          imageUrl: true,
          kingdomLabel: true,
          isDangerous: true,
          isBeneficial: true
        }
      }),
      db.microbe.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          slug: true,
          commonName: true,
          scientificName: true,
          descriptionShort: true,
          imageUrl: true,
          kingdomLabel: true,
          isDangerous: true,
          isBeneficial: true
        }
      }),
      db.microbe.findMany({
        take: 20,
        select: {
          commonName: true,
          scientificName: true,
          randomFacts: true
        }
      })
    ]);

    const facts = factSources.flatMap((item) => {
      const values = Array.isArray(item.randomFacts) ? item.randomFacts : [];
      return values.map((fact) => `${item.commonName || item.scientificName}: ${String(fact)}`);
    });

    return { stats, featuredMicrobes, latestMicrobes, facts };
  });
}

export async function getTaxonomySidebar() {
  return withCache("taxonomy:tree", 3600, async () => {
    const rows = await db.taxonomy.findMany({
      select: {
        kingdom: true,
        phylum: true,
        taxClass: true,
        order: true,
        family: true,
        genus: true
      }
    });

    return buildTaxonomyTree(rows);
  });
}

type EncyclopediaFilters = {
  page?: number;
  search?: string;
  sort?: string;
  kingdoms?: string[];
  dangerous?: boolean;
  beneficial?: boolean;
  relationship?: string[];
};

export async function getEncyclopediaData(filters: EncyclopediaFilters) {
  const page = filters.page || 1;
  const pageSize = 24;
  const cacheKey = `page:encyclopedia:${JSON.stringify(filters)}`;

  return withCache(cacheKey, 3600, async () => {
    const where: Prisma.MicrobeWhereInput = {
      AND: [
        filters.search
          ? {
              OR: [
                { scientificName: { contains: filters.search, mode: "insensitive" } },
                { commonName: { contains: filters.search, mode: "insensitive" } },
                { descriptionShort: { contains: filters.search, mode: "insensitive" } }
              ]
            }
          : {},
        filters.kingdoms?.length ? { kingdomLabel: { in: filters.kingdoms } } : {},
        filters.dangerous ? { isDangerous: true } : {},
        filters.beneficial ? { isBeneficial: true } : {},
        filters.relationship?.length ? { relationshipType: { in: filters.relationship as never } } : {}
      ]
    };

    let orderBy: Prisma.MicrobeOrderByWithRelationInput[] = [{ scientificName: "asc" }];

    switch (filters.sort) {
      case "z-a":
        orderBy = [{ scientificName: "desc" }];
        break;
      case "oldest":
        orderBy = [{ discoveryYear: "asc" }];
        break;
      case "newest":
        orderBy = [{ discoveryYear: "desc" }];
        break;
      case "dangerous":
        orderBy = [{ isDangerous: "desc" }, { bslLevel: "desc" }];
        break;
      case "beneficial":
        orderBy = [{ isBeneficial: "desc" }, { scientificName: "asc" }];
        break;
    }

    const [items, total, taxonomyTree] = await Promise.all([
      db.microbe.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          commonName: true,
          scientificName: true,
          descriptionShort: true,
          imageUrl: true,
          kingdomLabel: true,
          isDangerous: true,
          isBeneficial: true
        }
      }),
      db.microbe.count({ where }),
      getTaxonomySidebar()
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
      pageSize,
      taxonomyTree
    };
  });
}

export async function getMicrobeBySlug(slug: string) {
  return withCache(`microbe:${slug}`, 3600, async () => {
    const microbe = await db.microbe.findUnique({
      where: { slug },
      include: {
        taxonomy: true,
        diseases: {
          include: {
            disease: true
          }
        },
        images: {
          orderBy: [{ isPrimary: "desc" }, { id: "asc" }]
        },
        videos: {
          orderBy: { fetchedAt: "desc" }
        },
        ncbiData: true,
        timelineEvents: {
          orderBy: { year: "asc" }
        },
        references: {
          include: {
            reference: true
          }
        }
      }
    });

    if (!microbe) {
      return null;
    }

    const genus = microbe.taxonomy?.genus;
    const family = microbe.taxonomy?.family;
    const diseaseIds = microbe.diseases.map((item) => item.diseaseId);

    const related = await db.microbe.findMany({
      where: {
        slug: { not: slug },
        OR: [
          genus ? { taxonomy: { is: { genus } } } : undefined,
          family ? { taxonomy: { is: { family } } } : undefined,
          diseaseIds.length ? { diseases: { some: { diseaseId: { in: diseaseIds } } } } : undefined
        ].filter(Boolean) as Prisma.MicrobeWhereInput[]
      },
      take: 6,
      select: {
        slug: true,
        commonName: true,
        scientificName: true,
        descriptionShort: true,
        imageUrl: true,
        kingdomLabel: true,
        isDangerous: true,
        isBeneficial: true
      }
    });

    return {
      ...microbe,
      related
    };
  });
}

type DiseaseFilters = {
  query?: string;
  bodySystem?: string[];
  severity?: string[];
  transmissionRoute?: string[];
  microbeType?: string[];
  endemic?: boolean;
  epidemic?: boolean;
};

export async function getDiseaseLibraryData(filters: DiseaseFilters) {
  const cacheKey = `page:diseases:${JSON.stringify(filters)}`;

  return withCache(cacheKey, 3600, async () => {
    const where: Prisma.DiseaseWhereInput = {
      AND: [
        filters.query
          ? {
              OR: [
                { name: { contains: filters.query, mode: "insensitive" } },
                { icd10Code: { contains: filters.query, mode: "insensitive" } },
                { description: { contains: filters.query, mode: "insensitive" } }
              ]
            }
          : {},
        filters.bodySystem?.length ? { bodySystem: { in: filters.bodySystem } } : {},
        filters.severity?.length ? { severity: { in: filters.severity as never } } : {},
        filters.transmissionRoute?.length ? { transmissionRoute: { in: filters.transmissionRoute } } : {},
        filters.endemic ? { isEndemic: true } : {},
        filters.epidemic ? { isEpidemic: true } : {},
        filters.microbeType?.length
          ? {
              microbes: {
                some: {
                  microbe: {
                    kingdomLabel: {
                      in: filters.microbeType
                    }
                  }
                }
              }
            }
          : {}
      ]
    };

    return db.disease.findMany({
      where,
      orderBy: [{ severity: "desc" }, { name: "asc" }],
      include: {
        microbes: {
          include: {
            microbe: {
              select: { slug: true, scientificName: true, commonName: true, kingdomLabel: true }
            }
          }
        }
      }
    });
  });
}

export async function getDiseaseBySlug(slug: string) {
  return withCache(`disease:${slug}`, 3600, async () => {
    const disease = await db.disease.findUnique({
      where: { slug },
      include: {
        microbes: {
          include: {
            microbe: true
          }
        },
        references: {
          include: {
            reference: true
          }
        },
        timelineEvents: {
          orderBy: { year: "asc" }
        }
      }
    });

    if (!disease) {
      return null;
    }

    const related = await db.disease.findMany({
      where: {
        slug: { not: slug },
        bodySystem: disease.bodySystem
      },
      take: 6,
      select: {
        slug: true,
        name: true,
        severity: true,
        icd10Code: true
      }
    });

    return { ...disease, related };
  });
}

export async function getFlowcharts() {
  return withCache("page:flowcharts", 3600, async () =>
    db.flowchart.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }]
    })
  );
}

export async function getFlowchartBySlug(slug: string) {
  return withCache(`flowchart:${slug}`, 3600, async () =>
    db.flowchart.findUnique({
      where: { slug },
      include: {
        references: {
          include: {
            reference: true
          }
        }
      }
    })
  );
}

export async function getTimelineData(era?: string) {
  return withCache(`timeline:${era || "all"}`, 3600, async () => {
    const where: Prisma.TimelineEventWhereInput = era
      ? {
          year:
            era === "ancient"
              ? { lt: 1600 }
              : era === "1600-1800"
                ? { gte: 1600, lt: 1900 }
                : era === "1900-1950"
                  ? { gte: 1900, lt: 1950 }
                  : era === "1950-2000"
                    ? { gte: 1950, lt: 2000 }
                    : { gte: 2000 }
        }
      : {};

    return db.timelineEvent.findMany({
      where,
      include: {
        microbe: {
          select: { slug: true, scientificName: true }
        },
        disease: {
          select: { slug: true, name: true }
        }
      },
      orderBy: { year: "asc" }
    });
  });
}

export async function getEcologyData() {
  return withCache("page:ecology", 3600, async () => {
    const microbes = await db.microbe.findMany({
      where: { relationshipType: { not: null } },
      take: 48,
      include: {
        taxonomy: true
      }
    });

    const nodes = new Map<string, { id: string; group: "microbe" | "host"; label: string }>();
    const links: Array<{ source: string; target: string; relationship: string }> = [];

    microbes.forEach((microbe) => {
      nodes.set(microbe.id, { id: microbe.id, group: "microbe", label: microbe.scientificName });
      const hosts = Array.isArray(microbe.hostOrganisms) ? microbe.hostOrganisms : [];
      hosts.forEach((host) => {
        const hostId = slugify(String(host));
        if (!nodes.has(hostId)) {
          nodes.set(hostId, { id: hostId, group: "host", label: String(host) });
        }
        links.push({
          source: microbe.id,
          target: hostId,
          relationship: microbe.relationshipType || "commensal"
        });
      });
    });

    return {
      microbes,
      graph: {
        nodes: Array.from(nodes.values()),
        links
      }
    };
  });
}

export async function getReferencesLibrary(filters?: {
  query?: string;
  sourceType?: string;
  topic?: string;
  sort?: string;
}) {
  const cacheKey = `page:references:${JSON.stringify(filters || {})}`;

  return withCache(cacheKey, 3600, async () => {
    const references = await db.reference.findMany({
      where: {
        AND: [
          filters?.query
            ? {
                OR: [
                  { title: { contains: filters.query, mode: "insensitive" } },
                  { authors: { contains: filters.query, mode: "insensitive" } },
                  { journalOrPublisher: { contains: filters.query, mode: "insensitive" } }
                ]
              }
            : {},
          filters?.sourceType ? { sourceType: filters.sourceType as never } : {},
          filters?.topic ? { topic: filters.topic } : {}
        ]
      },
      include: {
        microbes: {
          include: {
            microbe: {
              select: { scientificName: true }
            }
          }
        },
        diseases: {
          include: {
            disease: {
              select: { name: true }
            }
          }
        }
      },
      orderBy:
        filters?.sort === "year-oldest"
          ? { year: "asc" }
          : filters?.sort === "alphabetical"
            ? { title: "asc" }
            : { year: "desc" }
    });

    return references.map((reference) => ({
      ...reference,
      usageCount: reference.microbes.length + reference.diseases.length
    }));
  });
}

export async function getAdminDashboardData() {
  return withCache("admin:dashboard", 120, async () => {
    const [microbes, diseases, flowcharts, timeline, recentMicrobes, activityLogs] = await Promise.all([
      db.microbe.count(),
      db.disease.count(),
      db.flowchart.count(),
      db.timelineEvent.count(),
      db.microbe.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, scientificName: true, createdAt: true }
      }),
      db.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { username: true } } }
      })
    ]);

    return {
      stats: { microbes, diseases, flowcharts, timeline },
      recentMicrobes,
      activityLogs
    };
  });
}
