import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/features/auth/lib/constants";

const PROTECTED_PATHS = ["/admin", "/support", "/company", "/requests"];

/**
 * Coarse gate: only checks that a session cookie is present, not that the
 * token is still valid — that verification happens server-side via
 * `GET /auth/me` in each protected page (`requireUser()`), which is the
 * real source of truth and handles expired/invalid tokens. This keeps
 * this fast and dependency-free (no JWT decoding on the Edge runtime).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/support/:path*", "/company/:path*", "/requests/:path*"],
};
