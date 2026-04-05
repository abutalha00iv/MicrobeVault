import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth";

const ADMIN_PATH = /^\/admin(?!\/login)/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!ADMIN_PATH.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isValid = token ? await verifyAdminToken(token).catch(() => null) : null;

  if (!isValid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};

