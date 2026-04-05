import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity, requireAdmin } from "@/lib/admin";
import { refreshSearchIndex } from "@/lib/search";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const disease = await db.disease.findUnique({
      where: { id },
      include: {
        microbes: true,
        references: true
      }
    });
    return NextResponse.json({ disease });
  }

  const diseases = await db.disease.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      microbes: {
        include: {
          microbe: true
        }
      }
    }
  });
  return NextResponse.json({ diseases });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { microbeIds = [], referenceIds = [], ...data } = body;

  const disease = await db.disease.create({
    data: {
      ...data,
      microbes: microbeIds.length
        ? {
            createMany: {
              data: microbeIds.map((microbeId: string) => ({ microbeId, role: "primary_cause" }))
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
    entityType: "disease",
    entityId: disease.id,
    description: `Created disease ${disease.name}`
  });

  return NextResponse.json({ disease });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { id, microbeIds = [], referenceIds = [], ...data } = body;

  const disease = await db.disease.update({
    where: { id },
    data
  });

  await db.microbeDisease.deleteMany({ where: { diseaseId: id } });
  if (microbeIds.length) {
    await db.microbeDisease.createMany({
      data: microbeIds.map((microbeId: string) => ({ diseaseId: id, microbeId, role: "primary_cause" }))
    });
  }

  await db.diseaseReference.deleteMany({ where: { diseaseId: id } });
  if (referenceIds.length) {
    await db.diseaseReference.createMany({
      data: referenceIds.map((referenceId: string) => ({ diseaseId: id, referenceId, contextNote: "Admin linked reference" }))
    });
  }

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "UPDATE",
    entityType: "disease",
    entityId: id,
    description: `Updated disease ${disease.name}`
  });

  return NextResponse.json({ disease });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.disease.delete({ where: { id } });
  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entityType: "disease",
    entityId: id,
    description: `Deleted disease ${id}`
  });

  return NextResponse.json({ ok: true });
}
