import { requestCategoryLabels } from "./labels";
import type { RequestDetail } from "../types";

export interface RequestInfoRow {
  label: string;
  value: string;
}

/**
 * Builds the "Información de la solicitud" rows — shared by the main
 * `/admin/requests/[id]` panel and the read-only client-history modal so
 * the "Tú" / "Sin asignar" / "Asignada a otro agente" phrasing never drifts
 * out of sync between the two.
 */
export function buildRequestInfoRows(
  request: RequestDetail,
  currentUserId: string,
  companyName: string | undefined,
  requesterName: string | undefined,
): RequestInfoRow[] {
  return [
    { label: "Categoría", value: requestCategoryLabels[request.category] },
    { label: "Empresa", value: companyName ?? request.companyId },
    {
      label: "Solicitante",
      value: request.createdBy === currentUserId ? "Tú" : (requesterName ?? request.createdBy),
    },
    {
      label: "Responsable",
      value:
        request.assignedTo === null
          ? "Sin asignar"
          : request.assignedTo === currentUserId
            ? "Tú"
            : "Asignada a otro agente",
    },
    { label: "Fecha de creación", value: request.createdAt },
    { label: "Última actualización", value: request.updatedAt },
    ...(request.resolvedAt ? [{ label: "Fecha de resolución", value: request.resolvedAt }] : []),
  ];
}
