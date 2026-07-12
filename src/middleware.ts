import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminOnlyPaths = ["/admin/settings", "/admin/users", "/admin/media", "/admin/tags", "/admin/comments"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  const role = (token.role as string | undefined) || "admin";

  if (role === "user") {
    return Response.redirect(new URL("/", req.url));
  }

  if (role === "editor" && adminOnlyPaths.some((p) => pathname.startsWith(p))) {
    return Response.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
