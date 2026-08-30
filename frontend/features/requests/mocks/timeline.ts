import type { RequestDetail, TimelineEvent } from "../types";
import { requestStatusLabels } from "../lib/labels";
import { getRequestDetail } from "./requestDetails";

const curatedTimelineById: Record<string, TimelineEvent[]> = {
  "REQ-1050": [
    {
      id: "REQ-1050-tl-1",
      type: "Solicitud creada",
      actor: "María Gómez",
      description: "María Gómez creó la solicitud.",
      timestamp: "30 ago 2026, 09:12",
    },
    {
      id: "REQ-1050-tl-2",
      type: "Asignación",
      actor: "Laura Sánchez",
      description: "La solicitud fue asignada a Laura Sánchez.",
      timestamp: "30 ago 2026, 09:35",
    },
    {
      id: "REQ-1050-tl-3",
      type: "Respuesta de soporte",
      actor: "Laura Sánchez",
      description: "Laura Sánchez respondió a la solicitud.",
      timestamp: "30 ago 2026, 09:40",
    },
    {
      id: "REQ-1050-tl-4",
      type: "Cambio de estado",
      actor: "Laura Sánchez",
      description: "El estado cambió a “En progreso”.",
      timestamp: "30 ago 2026, 10:05",
    },
    {
      id: "REQ-1050-tl-5",
      type: "Última actualización",
      actor: "Laura Sánchez",
      description: "Prioridad marcada como crítica.",
      timestamp: "30 ago 2026, 10:15",
    },
  ],
  "REQ-1049": [
    {
      id: "REQ-1049-tl-1",
      type: "Solicitud creada",
      actor: "Carlos Ruiz",
      description: "Carlos Ruiz creó la solicitud.",
      timestamp: "29 ago 2026, 16:20",
    },
    {
      id: "REQ-1049-tl-2",
      type: "Última actualización",
      actor: "Carlos Ruiz",
      description: "Aún sin asignar, en espera de revisión.",
      timestamp: "29 ago 2026, 16:20",
    },
  ],
  "REQ-1047": [
    {
      id: "REQ-1047-tl-1",
      type: "Solicitud creada",
      actor: "Andrés Torres",
      description: "Andrés Torres creó la solicitud.",
      timestamp: "28 ago 2026, 11:02",
    },
    {
      id: "REQ-1047-tl-2",
      type: "Asignación",
      actor: "Sofía Castro",
      description: "La solicitud fue asignada a Sofía Castro.",
      timestamp: "28 ago 2026, 11:15",
    },
    {
      id: "REQ-1047-tl-3",
      type: "Última actualización",
      actor: "Sofía Castro",
      description: "En investigación, sin cambios de estado aún.",
      timestamp: "28 ago 2026, 11:30",
    },
  ],
};

function buildDefaultTimeline(request: RequestDetail): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: `${request.id}-tl-1`,
      type: "Solicitud creada",
      actor: request.requesterName,
      description: `${request.requesterName} creó la solicitud.`,
      timestamp: request.createdAt,
    },
  ];

  if (request.assigneeName) {
    events.push({
      id: `${request.id}-tl-2`,
      type: "Asignación",
      actor: request.assigneeName,
      description: `La solicitud fue asignada a ${request.assigneeName}.`,
      timestamp: request.createdAt,
    });
  }

  events.push({
    id: `${request.id}-tl-last`,
    type: "Última actualización",
    actor: request.assigneeName ?? request.requesterName,
    description: `Estado actual: “${requestStatusLabels[request.status]}”.`,
    timestamp: request.updatedAt,
  });

  return events;
}

export function getRequestTimeline(id: string): TimelineEvent[] {
  const request = getRequestDetail(id);
  if (!request) return [];
  return curatedTimelineById[id] ?? buildDefaultTimeline(request);
}
