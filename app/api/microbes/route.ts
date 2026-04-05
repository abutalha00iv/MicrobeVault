import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, logActivity } from "@/lib/admin";
import { refreshSearchIndex } from "@/lib/search";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const microbe = await db.microbe.findUnique({
      where: { id },
      include: {
        taxonomy: true,
        diseases: true,
        images: true,
        references: true
      }
    });
    return NextResponse.json({ microbe });
  }

  const microbes = await db.microbe.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      taxonomy: true
    }
  });
  return NextResponse.json({ microbes });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { taxonomy, diseaseIds = [], images = [], referenceIds = [], ...data } = body;

  const microbe = await db.microbe.create({
    data: {
      ...data,
      taxonomy: taxonomy ? { create: taxonomy } : undefined,
      diseases: diseaseIds.length
        ? {
            createMany: {
              data: diseaseIds.map((diseaseId: string) => ({ diseaseId, role: "primary_cause" }))
            }
          }
        : undefined,
      images: images.length
        ? {
            createMany: {
              data: images
            }
          }
        : undefined,
      references: referenceIds.length
        ? {
            createMany: {
              data: referenceIds.map((referenceId: string) => ({ referenceId, contextNote: "Admin linked reference" }))
            }
          }
        : undefined
    }
  });

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "CREATE",
    entityType: "microbe",
    entityId: microbe.id,
    description: `Created microbe ${microbe.scientificName}`
  });

  return NextResponse.json({ microbe });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { id, taxonomy, diseaseIds = [], images = [], referenceIds = [], ...data } = body;

  const microbe = await db.microbe.update({
    where: { id },
    data
  });

  if (taxonomy) {
    await db.taxonomy.upsert({
      where: { microbeId: id },
      update: taxonomy,
      create: { ...taxonomy, microbeId: id }
    });
  }

  await db.microbeDisease.deleteMany({ where: { microbeId: id } });
  if (diseaseIds.length) {
    await db.microbeDisease.createMany({
      data: diseaseIds.map((diseaseId: string) => ({ microbeId: id, diseaseId, role: "primary_cause" }))
    });
  }

  await db.microbeImage.deleteMany({ where: { microbeId: id } });
  if (images.length) {
    await db.microbeImage.createMany({
      data: images.map((image: Record<string, unknown>) => ({ ...image, microbeId: id }))
    });
  }

  await db.microbeReference.deleteMany({ where: { microbeId: id } });
  if (referenceIds.length) {
    await db.microbeReference.createMany({
      data: referenceIds.map((referenceId: string) => ({ microbeId: id, referenceId, contextNote: "Admin linked reference" }))
    });
  }

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "UPDATE",
    entityType: "microbe",
    entityId: id,
    description: `Updated microbe ${microbe.scientificName}`
  });

  return NextResponse.json({ microbe });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.microbe.delete({ where: { id } });
  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entityType: "microbe",
    entityId: id,
    description: `Deleted microbe ${id}`
  });

  return NextResponse.json({ ok: true });
}

