"use client";

import { RequestActions } from "./RequestActions";
import { RequestTable } from "./RequestTable";
import type { RequestActionResult } from "../lib/actions";
import { getRequestCapabilities } from "../lib/permissions";
import type { RequestDetail } from "../types";
import type { AuthUser } from "@/features/auth/types";

interface AdminRequestsTableProps {
  requests: RequestDetail[];
  currentUser: AuthUser;
  takeAction: (id: string) => Promise<RequestActionResult>;
  returnAction: (id: string) => Promise<RequestActionResult>;
  resolveAction: (id: string) => Promise<RequestActionResult>;
}

/**
 * Client-side wrapper around `RequestTable` for the admin/support listing.
 * Exists because `renderActions`/`detailHref` are closures — a Server
 * Component page can't pass those straight into `RequestTable` (a Client
 * Component, needed for its own pagination state), only plain data and
 * Server Actions. So this owns the per-row action wiring on the client,
 * the same way `RequestsView` already owns the public `/requests` table.
 */
export function AdminRequestsTable({
  requests,
  currentUser,
  takeAction,
  returnAction,
  resolveAction,
}: AdminRequestsTableProps) {
  return (
    <RequestTable
      requests={requests}
      columns={["company", "requester", "assignee", "updatedAt"]}
      detailHref={(request) => `/admin/requests/${request.id}`}
      renderActions={(request) => {
        const { canTake, canReturn, canResolve } = getRequestCapabilities(request, currentUser);
        return (
          <RequestActions
            requestId={request.id}
            canTake={canTake}
            canReturn={canReturn}
            canResolve={canResolve}
            takeAction={takeAction}
            returnAction={returnAction}
            resolveAction={resolveAction}
          />
        );
      }}
    />
  );
}
