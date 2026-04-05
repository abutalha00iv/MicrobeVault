import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity, requireAdmin } from "@/lib/admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const users = await db.admin.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  if (auth.admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only super-admins can create admin users." }, { status: 403 });
  }

  const { username, password, role = "EDITOR" } = await request.json();

  if (typeof username !== "string" || username.trim().length < 3 || username.trim().length > 64) {
    return NextResponse.json({ error: "Username must be 3–64 characters." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!["SUPER_ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await db.admin.create({
    data: {
      username,
      hashedPassword,
      role
    }
  });

  await logActivity({
    adminId: auth.admin.id,
    action: "CREATE",
    entityType: "admin_user",
    entityId: user.id,
    description: `Created admin account ${user.username}`
  });

  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  if (auth.admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only super-admins can modify admin users." }, { status: 403 });
  }

  const body = await request.json();
  const { id, password, ...data } = body;

  const user = await db.admin.update({
    where: { id },
    data: {
      ...data,
      ...(password ? { hashedPassword: await bcrypt.hash(password, 12) } : {})
    }
  });

  await logActivity({
    adminId: auth.admin.id,
    action: "UPDATE",
    entityType: "admin_user",
    entityId: id,
    description: `Updated admin account ${user.username}`
  });

  return NextResponse.json({ user });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  if (auth.admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only super-admins can delete admin users." }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await db.admin.delete({ where: { id } });
  await logActivity({
    adminId: auth.admin.id,
    action: "DELETE",
    entityType: "admin_user",
    entityId: id,
    description: `Deleted admin account ${id}`
  });

  return NextResponse.json({ ok: true });
}
