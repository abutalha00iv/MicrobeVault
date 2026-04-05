import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    ok: true as const,
    admin
  };
}

export async function logActivity(input: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: unknown;
}) {
  await db.activityLog.create({
    data: {
      adminId: input.adminId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      description: input.description,
      metadata: input.metadata as never
    }
  });
}
