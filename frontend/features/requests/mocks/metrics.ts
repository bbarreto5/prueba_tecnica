import type { DashboardMetric } from "@/features/dashboard/types";
import { mockRequests } from "./requests";

export const requestsOverviewMetrics: DashboardMetric[] = [
  { label: "Total de solicitudes", value: mockRequests.length },
  {
    label: "Abiertas",
    value: mockRequests.filter((request) => request.status === "pending").length,
  },
  {
    label: "En progreso",
    value: mockRequests.filter((request) => request.status === "in_progress").length,
  },
  {
    label: "Resueltas",
    value: mockRequests.filter((request) => request.status === "resolved").length,
  },
  {
    label: "Prioridad crítica",
    value: mockRequests.filter((request) => request.priority === "urgent").length,
    hint: "Requieren atención inmediata",
  },
];
