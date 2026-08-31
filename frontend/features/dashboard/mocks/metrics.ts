import type { DashboardMetric } from "../types";

export const companyMetrics: DashboardMetric[] = [
  { label: "Solicitudes abiertas", value: 5 },
  { label: "En progreso", value: 3 },
  { label: "Resueltas", value: 21, hint: "Últimos 30 días" },
  { label: "Incidencias pendientes", value: 2 },
];

export const userMetrics: DashboardMetric[] = [
  { label: "Abiertas", value: 2 },
  { label: "En progreso", value: 1 },
  { label: "Resueltas", value: 9, hint: "Últimos 30 días" },
];
