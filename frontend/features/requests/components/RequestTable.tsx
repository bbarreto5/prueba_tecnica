import type { RequestSummary } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

export type RequestTableColumn = "company" | "requester" | "assignee" | "updatedAt";

interface RequestTableProps {
  requests: RequestSummary[];
  columns?: RequestTableColumn[];
  titleColumnLabel?: string;
}

export function RequestTable({
  requests,
  columns = [],
  titleColumnLabel = "Asunto",
}: RequestTableProps) {
  const showCompany = columns.includes("company");
  const showRequester = columns.includes("requester");
  const showAssignee = columns.includes("assignee");
  const showUpdatedAt = columns.includes("updatedAt");
  const columnCount =
    5 + [showCompany, showRequester, showUpdatedAt, showAssignee].filter(Boolean).length;

  return (
    <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#e5e5e5] text-xs tracking-wide text-[#6a7282] uppercase">
            <th className="py-3 pr-4 font-medium">ID</th>
            <th className="py-3 pr-4 font-medium">{titleColumnLabel}</th>
            {showCompany ? <th className="py-3 pr-4 font-medium">Empresa</th> : null}
            {showRequester ? (
              <th className="py-3 pr-4 font-medium">Usuario</th>
            ) : null}
            <th className="py-3 pr-4 font-medium">Prioridad</th>
            <th className="py-3 pr-4 font-medium">Estado</th>
            <th className="py-3 pr-4 font-medium">Fecha</th>
            {showUpdatedAt ? (
              <th className="py-3 pr-4 font-medium">Última actualización</th>
            ) : null}
            {showAssignee ? (
              <th className="py-3 pr-0 font-medium">Responsable</th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="py-6 text-center text-sm text-[#6a7282]"
              >
                No hay solicitudes para mostrar.
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request.id} className="border-b border-[#f3f4f6] last:border-0">
                <td className="py-3 pr-4 font-medium text-[#101828]">{request.id}</td>
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
                  <td className="py-3 pr-0 text-[#6a7282]">
                    {request.assigneeName ?? "Sin asignar"}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
