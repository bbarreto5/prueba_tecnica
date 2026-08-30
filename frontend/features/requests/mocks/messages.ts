import type { RequestDetail, RequestMessage } from "../types";
import { getRequestDetail } from "./requestDetails";

const curatedMessagesById: Record<string, RequestMessage[]> = {
  "REQ-1050": [
    {
      id: "REQ-1050-msg-1",
      author: "María Gómez",
      role: "requester",
      content:
        "Hola, no logro acceder al portal de facturación desde ayer. Me aparece un error 403 al iniciar sesión.",
      timestamp: "30 ago 2026, 09:12",
    },
    {
      id: "REQ-1050-msg-2",
      author: "Laura Sánchez",
      role: "support",
      content:
        "Hola María, gracias por avisarnos. Estamos revisando los permisos de tu cuenta, dame unos minutos.",
      timestamp: "30 ago 2026, 09:40",
    },
    {
      id: "REQ-1050-msg-3",
      author: "Laura Sánchez",
      role: "support",
      content:
        "Detectamos que tu usuario perdió el rol de facturación tras la última actualización. Ya lo estamos corrigiendo.",
      timestamp: "30 ago 2026, 10:05",
    },
    {
      id: "REQ-1050-msg-4",
      author: "María Gómez",
      role: "requester",
      content: "Perfecto, quedo atenta. Es urgente porque tenemos que cerrar el mes.",
      timestamp: "30 ago 2026, 10:11",
    },
    {
      id: "REQ-1050-msg-5",
      author: "Laura Sánchez",
      role: "support",
      content:
        "Entendido, la marcamos como prioridad crítica y te confirmamos en cuanto quede resuelto.",
      timestamp: "30 ago 2026, 10:15",
    },
  ],
  "REQ-1049": [
    {
      id: "REQ-1049-msg-1",
      author: "Carlos Ruiz",
      role: "requester",
      content:
        "El reporte mensual se está generando vacío desde el cierre de agosto. ¿Pueden revisarlo?",
      timestamp: "29 ago 2026, 16:20",
    },
  ],
  "REQ-1047": [
    {
      id: "REQ-1047-msg-1",
      author: "Andrés Torres",
      role: "requester",
      content: "El módulo de reportes se cae de forma intermitente, ya van 3 veces hoy.",
      timestamp: "28 ago 2026, 11:02",
    },
    {
      id: "REQ-1047-msg-2",
      author: "Sofía Castro",
      role: "support",
      content:
        "Gracias por reportarlo, lo tomamos como prioridad crítica y comenzamos la revisión.",
      timestamp: "28 ago 2026, 11:30",
    },
  ],
};

function buildDefaultMessages(request: RequestDetail): RequestMessage[] {
  const messages: RequestMessage[] = [
    {
      id: `${request.id}-msg-1`,
      author: request.requesterName,
      role: "requester",
      content: `Hola, quería dar seguimiento a esta solicitud: "${request.title}".`,
      timestamp: request.createdAt,
    },
  ];

  if (request.assigneeName) {
    messages.push({
      id: `${request.id}-msg-2`,
      author: request.assigneeName,
      role: "support",
      content: "Gracias por el reporte, ya estamos revisando el caso.",
      timestamp: request.updatedAt,
    });
  }

  return messages;
}

export function getRequestMessages(id: string): RequestMessage[] {
  const request = getRequestDetail(id);
  if (!request) return [];
  return curatedMessagesById[id] ?? buildDefaultMessages(request);
}
