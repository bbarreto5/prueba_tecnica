import { cache } from "react";
import { redirect } from "next/navigation";
import { fetchCurrentUser } from "@/services/auth";
import { mapBackendRole } from "@/types/role";
import type { AuthUser } from "../types";
import { getSessionToken } from "./session";

/**
 * Resolves the authenticated user from the session cookie via `GET /auth/me`.
 * Memoized per request (`react/cache`) so multiple callers in the same
 * render (layout, page, nav) never trigger duplicate network calls.
 * Returns `null` for "no session" as well as any failure — 401 (expired/
 * invalid token) and network errors are both treated as "not authenticated"
 * here; callers that need to react to connectivity issues differently
 * should call the service directly instead of this cached helper.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const raw = await fetchCurrentUser(token);
    return {
      id: raw.id,
      email: raw.email,
      name: raw.name,
      role: mapBackendRole(raw.role),
    };
  } catch {
    return null;
  }
});

/**
 * Guards a protected Server Component page: returns the current user, or
 * redirects to `/login` (via a Route Handler that first clears the stale
 * cookie — a plain page render isn't allowed to mutate cookies itself).
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/api/auth/session-expired");
  }
  return user;
}
