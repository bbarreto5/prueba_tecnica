"use client";

import Link from "next/link";
import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { RequestSummary } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

export type RequestTableColumn = "company" | "requester" | "assignee" | "updatedAt";

/** Table cells show only the first 5 characters of the id — the full value is still in the row's `title` attribute and, where linked, the href. */
function truncateId(id: string): string {
  return id.slice(0, 5);
}

interface RequestTableProps<T extends RequestSummary> {
  requests: T[];
  columns?: RequestTableColumn[];
  titleColumnLabel?: string;
  /** Renders an extra "Acciones" column for each row when provided (e.g. Tomar/Devolver/Resolver). */
  renderActions?: (request: T) => React.ReactNode;
  /** Base path for the row's detail link — defaults to the public `/requests/[id]` route. */
  detailHref?: (request: T) => string;
  /**
   * Simpler alternative to `detailHref` for Server Component callers: a
   * function prop can't cross the server/client boundary directly (this is
   * a Client Component), but a plain string can. Ignored if `detailHref` is
   * also provided.
   */
  detailBasePath?: string;
  /** Set to `false` when this role has no accessible detail route for these rows — renders the id as plain text instead of a broken link. */
  linkToDetail?: boolean;
}

export function RequestTable<T extends RequestSummary>({
  requests,
  columns = [],
  titleColumnLabel = "Asunto",
  renderActions,
  detailHref,
  detailBasePath = "/requests",
  linkToDetail = true,
}: RequestTableProps<T>) {
  const showCompany = columns.includes("company");
  const showRequester = columns.includes("requester");
  const showAssignee = columns.includes("assignee");
  const showUpdatedAt = columns.includes("updatedAt");
  const showActions = Boolean(renderActions);
  const columnCount =
    5 +
    [showCompany, showRequester, showUpdatedAt, showAssignee, showActions].filter(Boolean).length;

  const { page, pageSize, pageCount, pageItems, totalItems, goToPage, changePageSize } =
    usePagination(requests);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-xs tracking-wide text-[#6a7282] uppercase">
              <th className="py-3 pr-4 font-medium">ID</th>
              <th className="py-3 pr-4 font-medium">{titleColumnLabel}</th>
              {showCompany ? <th className="py-3 pr-4 font-medium">Empresa</th> : null}
              {showRequester ? <th className="py-3 pr-4 font-medium">Usuario</th> : null}
              <th className="py-3 pr-4 font-medium">Prioridad</th>
              <th className="py-3 pr-4 font-medium">Estado</th>
              <th className="py-3 pr-4 font-medium">Fecha</th>
              {showUpdatedAt ? (
                <th className="py-3 pr-4 font-medium">Última actualización</th>
              ) : null}
              {showAssignee ? <th className="py-3 pr-4 font-medium">Responsable</th> : null}
              {showActions ? <th className="py-3 pr-0 font-medium">Acciones</th> : null}
            </tr>
          </thead>
          <tbody>
            {totalItems === 0 ? (
              <tr>
                <td colSpan={columnCount} className="py-6 text-center text-sm text-[#6a7282]">
                  No hay solicitudes para mostrar.
                </td>
              </tr>
            ) : (
              pageItems.map((request) => (
                <tr
                  key={request.id}
                  className="border-b border-[#f3f4f6] transition-colors last:border-0 hover:bg-[#f9fafb]"
                >
                  <td className="py-3 pr-4 font-medium text-[#101828]" title={request.id}>
                    {linkToDetail ? (
                      <Link
                        href={detailHref ? detailHref(request) : `${detailBasePath}/${request.id}`}
                        className="rounded-sm text-[#101828] underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current focus-visible:decoration-current focus-visible:outline-none"
                      >
                        {truncateId(request.id)}
                      </Link>
                    ) : (
                      truncateId(request.id)
                    )}
                  </td>
                  <td className="py-3 pr-4 text-[#101828]">{request.title}</td>
                  {showCompany ? (
                    <td className="py-3 pr-4 text-[#6a7282]">{request.companyName}</td>
                  ) : null}
                  {showRequester ? (
                    <td className="py-3 pr-4 text-[#6a7282]">{request.requesterName}</td>
                  ) : null}
                  <td className="py-3 pr-4">
                    <PriorityBadge priority={request.priority} />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="py-3 pr-4 text-[#6a7282]">{request.createdAt}</td>
                  {showUpdatedAt ? (
                    <td className="py-3 pr-4 text-[#6a7282]">{request.updatedAt}</td>
                  ) : null}
                  {showAssignee ? (
                    <td className="py-3 pr-4 text-[#6a7282]">
                      {request.assigneeName ?? "Sin asignar"}
                    </td>
                  ) : null}
                  {showActions ? (
                    <td className="py-3 pr-0">{renderActions?.(request)}</td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
