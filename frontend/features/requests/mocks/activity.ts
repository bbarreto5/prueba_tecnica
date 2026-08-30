import type { ActivityEvent } from "../types";

export const acmeCorpActivity: ActivityEvent[] = [
  {
    id: "act-1",
    description:
      "María Gómez creó la solicitud “No se puede acceder al portal de facturación”.",
    timestamp: "Hace 2 horas",
  },
  {
    id: "act-2",
    description: "Soporte respondió a la solicitud REQ-1050.",
    timestamp: "Hace 5 horas",
  },
  {
    id: "act-3",
    description: "La solicitud REQ-1044 pasó a “Resuelta”.",
    timestamp: "Ayer",
  },
  {
    id: "act-4",
    description: "Carlos Ruiz creó la solicitud “Error al generar reporte mensual”.",
    timestamp: "Hace 2 días",
  },
  {
    id: "act-5",
    description: "La solicitud REQ-1041 fue marcada como “Resuelta”.",
    timestamp: "Hace 4 días",
  },
];
