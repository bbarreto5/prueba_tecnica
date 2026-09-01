import { cache } from "react";
import { getSessionToken } from "@/features/auth/lib/session";
import { getRequest, listRequests } from "@/services/requests";
import { listRequestMessages } from "@/services/messages";
import { toMessage, toRequestDetail } from "./mappers";
import type { Message, RequestDetail } from "../types";

/**
 * Fetches the requests visible to the current session (backend already
 * scopes them by role/company). Throws on failure — callers render the
 * error state. Sorted newest-created-first — the single point all request
 * tables/lists in the app pull from, so none of them need to re-sort or
 * assume anything about the backend's own ordering.
 */
export async function getRequests(): Promise<RequestDetail[]> {
  const token = await getSessionToken();
  if (!token) return [];

  const requests = await listRequests(token);
  return requests
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(toRequestDetail);
}

/**
 * Fetches a single request. Throws `ApiError` on failure — 404 when it
 * doesn't exist, 403 when it exists but isn't visible to this user (a
 * different company's request). The caller distinguishes 404 from other
 * statuses to show "not found" vs a generic error state.
 * Memoized per request (`react/cache`) so `generateMetadata` and the page
 * component share the same fetch instead of hitting the backend twice.
 */
export const getRequestDetail = cache(async (id: string): Promise<RequestDetail | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  const request = await getRequest(token, id);
  return toRequestDetail(request);
});

export async function getRequestMessages(id: string): Promise<Message[]> {
  const token = await getSessionToken();
  if (!token) return [];

  const messages = await listRequestMessages(token, id);
  return messages.map(toMessage);
}
