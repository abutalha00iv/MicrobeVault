import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity, requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const reference = await db.reference.findUnique({
      where: { id }
    });
    return NextResponse.json({ reference });
  }

  const references = await db.reference.findMany({
    orderBy: { year: "desc" }
  });
  return NextResponse.json({ references });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const reference = await db.reference.create({
    data: {
      ...body,
      addedByAdminId: auth.admin.id
    }
  });

  await logActivity({
    adminId: auth.admin.id,
    action: "CREATE",
    entityType: "reference",
    entityId: reference.id,
    description: `Created reference ${reference.title}`
  });

  return NextResponse.json({ reference });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { id, ...data } = body;
  const reference = await db.reference.update({
    where: { id },
    data
  });

  await logActivity({
    adminId: auth.admin.id,
    action: "UPDATE",
    entityType: "reference",
    entityId: reference.id,
    description: `Updated reference ${reference.title}`
  });

  return NextResponse.json({ reference });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.reference.delete({ where: { id } });
  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entityType: "reference",
    entityId: id,
    description: `Deleted reference ${id}`
  });

  return NextResponse.json({ ok: true });
}

