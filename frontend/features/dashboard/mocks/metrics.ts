import type { DashboardMetric } from "../types";

export const userMetrics: DashboardMetric[] = [
  { label: "Abiertas", value: 2 },
  { label: "En progreso", value: 1 },
  { label: "Resueltas", value: 9, hint: "Últimos 30 días" },
];
