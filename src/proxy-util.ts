import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (pathname.startsWith("/admin/login") && token) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname.startsWith("/admin") && !token && pathname !== "/admin/login") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
