import type { AuthUser } from "@/features/auth/types";
import type { RequestDetail } from "../types";

export interface RequestCapabilities {
  canTake: boolean;
  canReturn: boolean;
  canResolve: boolean;
  canReply: boolean;
}

/**
 * Mirrors the backend's take/return/resolve authorization exactly (see
 * app/application/requests/{take,return,resolve}_request.py): the routes are
 * already ADMIN/SUPPORT-only, and within that, SUPPORT may only act on a
 * request currently assigned to themself while ADMIN may act on any
 * IN_PROGRESS request. This is NOT the security boundary — the backend
 * re-validates independently and returns 403/409 regardless of what the UI
 * shows; this only decides which buttons to render.
 *
 * `canReply` is different: the backend's messages endpoint has no
 * "must be assignee" rule for any role (see app/application/messages — only
 * the request-closed check exists), so ADMIN keeps that real, unrestricted
 * permission. Restricting replies to "only the current assignee" is a
 * SUPPORT-only UX rule (so a request being worked stays owned by whoever
 * actually holds it), not a backend one.
 */
export function getRequestCapabilities(
  request: RequestDetail,
  user: AuthUser,
): RequestCapabilities {
  if (user.role !== "admin" && user.role !== "support") {
    return { canTake: false, canReturn: false, canResolve: false, canReply: false };
  }

  const isClosed = request.status === "resolved" || request.status === "cancelled";
  const isAssignedToMe = request.assignedTo === user.id;
  const canActOnAssignment = user.role === "admin" || isAssignedToMe;
  const isInProgress = request.status === "in_progress";

  return {
    canTake: request.status === "pending",
    canReturn: isInProgress && canActOnAssignment,
    canResolve: isInProgress && canActOnAssignment,
    canReply: !isClosed && (user.role === "admin" || isAssignedToMe),
  };
}
