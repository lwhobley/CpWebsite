import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/checklists",
  "/permits",
  "/inventory",
  "/audits",
  "/certifications",
  "/assistant",
  "/admin",
  "/pos",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = protectedRoutes.some((route) => pathname.startsWith(route));
  const hasSession =
    request.cookies.has("enish_ops_session") ||
    request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));

  if (needsAuth && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checklists/:path*",
    "/permits/:path*",
    "/inventory/:path*",
    "/audits/:path*",
    "/certifications/:path*",
    "/assistant/:path*",
    "/admin/:path*",
    "/pos/:path*",
  ],
};
