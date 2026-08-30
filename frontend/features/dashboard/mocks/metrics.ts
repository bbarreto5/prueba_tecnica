import type { DashboardMetric } from "../types";

export const adminMetrics: DashboardMetric[] = [
  { label: "Empresas", value: 24, hint: "3 nuevas este mes" },
  { label: "Usuarios registrados", value: 186 },
  { label: "Solicitudes abiertas", value: 32 },
  { label: "Solicitudes pendientes", value: 18 },
  { label: "Solicitudes resueltas", value: 247, hint: "Últimos 30 días" },
  { label: "Incidencias críticas", value: 5, hint: "Requieren atención inmediata" },
];

export const supportMetrics: DashboardMetric[] = [
  { label: "Asignadas a mí", value: 4 },
  { label: "Pendientes", value: 6 },
  { label: "En progreso", value: 8 },
  { label: "Resueltas", value: 52, hint: "Últimos 30 días" },
  { label: "Prioridad alta", value: 4 },
  { label: "Tiempo promedio de resolución", value: "5.4h" },
];

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
