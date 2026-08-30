/**
 * Shared with `middleware.ts` at the project root, which cannot import
 * `next/headers` (Edge runtime) — kept in its own file with zero framework
 * imports so both sides stay in sync on a single source of truth.
 */
export const SESSION_COOKIE_NAME = "session_token";
