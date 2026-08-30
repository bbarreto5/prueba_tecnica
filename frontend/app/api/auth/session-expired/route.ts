import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/features/auth/lib/session";

/**
 * Clears an invalid/expired session cookie and sends the user to /login.
 * Exists only because Next.js forbids mutating cookies during a plain page
 * render — protected pages redirect here instead of clearing the cookie
 * themselves (see `features/auth/lib/currentUser.ts::requireUser`).
 */
export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
