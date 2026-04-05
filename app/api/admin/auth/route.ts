import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const admin = await db.admin.findUnique({
      where: { username }
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.hashedPassword);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await createAdminToken({
      id: admin.id,
      username: admin.username,
      role: admin.role
    });

    const isProduction = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ ok: true, username: admin.username, role: admin.role });
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch {
    return NextResponse.json({ error: "An internal error occurred." }, { status: 500 });
  }
}

