import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchNcbiBundle } from "@/lib/ncbi";
import { requireAdmin, logActivity } from "@/lib/admin";
import { slugify } from "@/lib/utils";

async function attachNcbiReferences(microbeId: string, scientificName: string, taxonomyId: number, abstracts: Array<{ pmid: string; title: string }>) {
  const ncbiReference = await db.reference.upsert({
    where: {
      doi: `ncbi-taxonomy-${taxonomyId}`
    },
    update: {
      title: `NCBI Taxonomy: ${scientificName}`,
      url: `https://www.ncbi.nlm.nih.gov/taxonomy/${taxonomyId}`,
      sourceType: "ncbi",
      accessedDate: new Date(),
      isVerified: true
    },
    create: {
      title: `NCBI Taxonomy: ${scientificName}`,
      doi: `ncbi-taxonomy-${taxonomyId}`,
      url: `https://www.ncbi.nlm.nih.gov/taxonomy/${taxonomyId}`,
      sourceType: "ncbi",
      accessedDate: new Date(),
      isVerified: true,
      topic: "General Microbiology"
    }
  });

  await db.microbeReference.upsert({
    where: {
      microbeId_referenceId: {
        microbeId,
        referenceId: ncbiReference.id
      }
    },
    update: {
      contextNote: "Used for taxonomy and NCBI panel"
    },
    create: {
      microbeId,
      referenceId: ncbiReference.id,
      contextNote: "Used for taxonomy and NCBI panel"
    }
  });

  for (const abstract of abstracts) {
    const reference = await db.reference.upsert({
      where: {
        doi: `pmid-${abstract.pmid}`
      },
      update: {
        title: abstract.title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${abstract.pmid}/`,
        sourceType: "ncbi",
        accessedDate: new Date(),
        isVerified: true
      },
      create: {
        title: abstract.title,
        doi: `pmid-${abstract.pmid}`,
        url: `https://pubmed.ncbi.nlm.nih.gov/${abstract.pmid}/`,
        sourceType: "ncbi",
        accessedDate: new Date(),
        isVerified: true,
        topic: "General Microbiology"
      }
    });

    await db.microbeReference.upsert({
      where: {
        microbeId_referenceId: {
          microbeId,
          referenceId: reference.id
        }
      },
      update: {
        contextNote: "Used for PubMed abstract panel"
      },
      create: {
        microbeId,
        referenceId: reference.id,
        contextNote: "Used for PubMed abstract panel"
      }
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const term = request.nextUrl.searchParams.get("term") || undefined;
    const taxonomyId = request.nextUrl.searchParams.get("taxonomyId");
    const microbeId = request.nextUrl.searchParams.get("microbeId");

    let microbe = null;
    if (microbeId) {
      microbe = await db.microbe.findUnique({ where: { id: microbeId } });
    }

    const data = await fetchNcbiBundle({
      term: term || microbe?.scientificName || undefined,
      taxonomyId: taxonomyId ? Number(taxonomyId) : microbe?.ncbiTaxonomyId || undefined
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "NCBI fetch failed." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const microbeId = url.searchParams.get("microbeId");
    const refresh = url.searchParams.get("refresh") === "true";
    const body = await request.json().catch(() => ({}));
    const term = body.term || url.searchParams.get("term");

    if (microbeId) {
      const microbe = await db.microbe.findUnique({ where: { id: microbeId } });
      if (!microbe) {
        return NextResponse.json({ error: "Microbe not found." }, { status: 404 });
      }

      const data = await fetchNcbiBundle({
        term: microbe.scientificName,
        taxonomyId: microbe.ncbiTaxonomyId || undefined
      });

      const ncbiData = await db.ncbiData.upsert({
        where: { microbeId },
        update: {
          taxonomyJson: data.taxonomyJson as never,
          sequenceSummary: data.sequenceSummary,
          genbankCount: data.genbankCount,
          pubmedCount: data.pubmedCount,
          pubmedAbstracts: data.pubmedAbstracts as never,
          lastFetched: new Date()
        },
        create: {
          microbeId,
          taxonomyJson: data.taxonomyJson as never,
          sequenceSummary: data.sequenceSummary,
          genbankCount: data.genbankCount,
          pubmedCount: data.pubmedCount,
          pubmedAbstracts: data.pubmedAbstracts as never
        }
      });

      await db.microbe.update({
        where: { id: microbeId },
        data: {
          ncbiTaxonomyId: data.taxonomyId,
          ncbiLastFetched: new Date()
        }
      });

      await attachNcbiReferences(microbeId, microbe.scientificName, data.taxonomyId, data.pubmedAbstracts);

      await logActivity({
        adminId: auth.admin.id,
        action: refresh ? "REFRESH" : "FETCH",
        entityType: "ncbi_data",
        entityId: microbeId,
        description: `Fetched NCBI data for ${microbe.scientificName}`
      });

      return NextResponse.json({
        data: {
          ...data,
          lastFetched: ncbiData.lastFetched
        }
      });
    }

    if (!term) {
      return NextResponse.json({ error: "Provide term or microbeId." }, { status: 400 });
    }

    const data = await fetchNcbiBundle({ term });

    if (body.import) {
      const created = await db.microbe.upsert({
        where: { slug: slugify(term) },
        update: {
          scientificName: data.officialName,
          ncbiTaxonomyId: data.taxonomyId,
          ncbiLastFetched: new Date(),
          descriptionShort: `Imported from NCBI Taxonomy for ${data.officialName}.`
        },
        create: {
          slug: slugify(term),
          scientificName: data.officialName,
          commonName: data.officialName,
          descriptionShort: `Imported from NCBI Taxonomy for ${data.officialName}.`,
          descriptionLong: `NCBI Explorer import for ${data.officialName}. Review and enrich this record in the admin panel.`,
          kingdomLabel: data.taxonomyJson.rank || "Imported",
          ncbiTaxonomyId: data.taxonomyId,
          ncbiLastFetched: new Date()
        }
      });

      await db.ncbiData.upsert({
        where: { microbeId: created.id },
        update: {
          taxonomyJson: data.taxonomyJson as never,
          sequenceSummary: data.sequenceSummary,
          genbankCount: data.genbankCount,
          pubmedCount: data.pubmedCount,
          pubmedAbstracts: data.pubmedAbstracts as never,
          lastFetched: new Date()
        },
        create: {
          microbeId: created.id,
          taxonomyJson: data.taxonomyJson as never,
          sequenceSummary: data.sequenceSummary,
          genbankCount: data.genbankCount,
          pubmedCount: data.pubmedCount,
          pubmedAbstracts: data.pubmedAbstracts as never
        }
      });

      await attachNcbiReferences(created.id, data.officialName, data.taxonomyId, data.pubmedAbstracts);

      await logActivity({
        adminId: auth.admin.id,
        action: "IMPORT",
        entityType: "microbe",
        entityId: created.id,
        description: `Imported ${data.officialName} from NCBI`
      });

      return NextResponse.json({ data, imported: created });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "NCBI fetch failed." }, { status: 500 });
  }
}

