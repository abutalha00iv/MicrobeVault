import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity, requireAdmin } from "@/lib/admin";
import { refreshSearchIndex } from "@/lib/search";

export async function GET() {
  const events = await db.timelineEvent.findMany({
    orderBy: { year: "desc" },
    include: {
      microbe: true,
      disease: true
    }
  });
  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const event = await db.timelineEvent.create({
    data: body
  });

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "CREATE",
    entityType: "timeline_event",
    entityId: event.id,
    description: `Created timeline event ${event.title}`
  });

  return NextResponse.json({ event });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { id, ...data } = body;
  const event = await db.timelineEvent.update({
    where: { id },
    data
  });

  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "UPDATE",
    entityType: "timeline_event",
    entityId: event.id,
    description: `Updated timeline event ${event.title}`
  });

  return NextResponse.json({ event });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.timelineEvent.delete({ where: { id } });
  await refreshSearchIndex();
  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entityType: "timeline_event",
    entityId: id,
    description: `Deleted timeline event ${id}`
  });

  return NextResponse.json({ ok: true });
}

