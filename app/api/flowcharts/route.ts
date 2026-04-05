import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity, requireAdmin } from "@/lib/admin";
import { refreshSearchIndex } from "@/lib/search";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const flowchart = await db.flowchart.findUnique({
      where: { id },
      include: { references: true }
    });
    return NextResponse.json({ flowchart });
  }

  const flowcharts = await db.flowchart.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ flowcharts });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { referenceIds = [], ...data } = body;
  const flowchart = await db.flowchart.create({
    data: {
      ...data,
      references: referenceIds.length
        ? {
            createMany: {
              data: referenceIds.map((referenceId: string) => ({ referenceId, contextNote: "Based on source" }))
            }
          }
        : undefined
    }
  });

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "CREATE",
    entityType: "flowchart",
    entityId: flowchart.id,
    description: `Created flowchart ${flowchart.title}`
  });

  return NextResponse.json({ flowchart });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { id, referenceIds = [], ...data } = body;
  const flowchart = await db.flowchart.update({
    where: { id },
    data
  });

  await db.flowchartReference.deleteMany({ where: { flowchartId: id } });
  if (referenceIds.length) {
    await db.flowchartReference.createMany({
      data: referenceIds.map((referenceId: string) => ({ flowchartId: id, referenceId, contextNote: "Based on source" }))
    });
  }

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "UPDATE",
    entityType: "flowchart",
    entityId: id,
    description: `Updated flowchart ${flowchart.title}`
  });

  return NextResponse.json({ flowchart });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.flowchart.delete({ where: { id } });
  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entityType: "flowchart",
    entityId: id,
    description: `Deleted flowchart ${id}`
  });

  return NextResponse.json({ ok: true });
}

