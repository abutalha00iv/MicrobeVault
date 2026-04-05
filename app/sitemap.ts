import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [microbes, diseases, flowcharts] = await Promise.all([
    db.microbe.findMany({ select: { slug: true, updatedAt: true } }),
    db.disease.findMany({ select: { slug: true, createdAt: true } }),
    db.flowchart.findMany({ select: { slug: true, createdAt: true } })
  ]);

  const staticRoutes = [
    "/",
    "/encyclopedia",
    "/diseases",
    "/ai-tools",
    "/flowcharts",
    "/timeline",
    "/ncbi-explorer",
    "/ecology",
    "/references",
    "/search",
    "/about"
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route),
      lastModified: new Date()
    })),
    ...microbes.map((microbe) => ({
      url: absoluteUrl(`/microbe/${microbe.slug}`),
      lastModified: microbe.updatedAt
    })),
    ...diseases.map((disease) => ({
      url: absoluteUrl(`/disease/${disease.slug}`),
      lastModified: disease.createdAt
    })),
    ...flowcharts.map((flowchart) => ({
      url: absoluteUrl(`/flowchart/${flowchart.slug}`),
      lastModified: flowchart.createdAt
    }))
  ];
}

