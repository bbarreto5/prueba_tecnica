"use client";

import Link from "next/link";
import { RequestTable } from "./RequestTable";
import type { RequestDetail } from "../types";

interface AdminRequestsTableProps {
  requests: RequestDetail[];
}

/**
 * Client-side wrapper around `RequestTable` for the admin/support listing.
 * The listing is navigation-only — Tomar/Devolver/Resolver only make sense
 * once the agent has reviewed the full request, so they live exclusively on
 * `/admin/requests/[id]`, never here (see AGENTS.md note on this decision).
 */
export function AdminRequestsTable({ requests }: AdminRequestsTableProps) {
  return (
    <RequestTable
      requests={requests}
      columns={["company", "requester", "assignee", "updatedAt"]}
      detailHref={(request) => `/admin/requests/${request.id}`}
      renderActions={(request) => (
        <Link
          href={`/admin/requests/${request.id}`}
          className="rounded-sm text-sm font-medium text-[#ff8b1a] underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current focus-visible:decoration-current focus-visible:outline-none"
        >
          Ver detalle
        </Link>
      )}
    />
  );
}
