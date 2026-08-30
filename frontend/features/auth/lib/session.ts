import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";

/** Falls back to the backend's documented default (JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60) if the token can't be decoded. */
const DEFAULT_MAX_AGE_SECONDS = 60 * 60;

/**
 * Sets the session cookie. Must be called from a Server Action or Route
 * Handler (Next.js forbids mutating cookies during a plain page render).
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getTokenMaxAge(token),
  });
}

/** Reads the session token from the incoming request's cookies. Safe to call from Server Components. */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * Clears the session cookie. Must be called from a Server Action or Route
 * Handler — see `app/api/auth/session-expired/route.ts` for the one place
 * a plain page render needs this (via a redirect through that route).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Reads the JWT's `exp` claim (no signature verification — only used to size the cookie lifetime) so the cookie doesn't outlive the token. */
function getTokenMaxAge(token: string): number {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as {
      exp?: number;
    };
    if (!decoded.exp) return DEFAULT_MAX_AGE_SECONDS;

    const secondsRemaining = decoded.exp - Math.floor(Date.now() / 1000);
    return secondsRemaining > 0 ? secondsRemaining : DEFAULT_MAX_AGE_SECONDS;
  } catch {
    return DEFAULT_MAX_AGE_SECONDS;
  }
}
