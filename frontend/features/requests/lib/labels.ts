import type { BadgeTone } from "@/components/Badge";
import type { RequestPriority, RequestStatus } from "../types";

export const requestStatusLabels: Record<RequestStatus, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  resolved: "Resuelta",
  cancelled: "Cancelada",
};

export const requestStatusTones: Record<RequestStatus, BadgeTone> = {
  pending: "neutral",
  in_progress: "info",
  resolved: "success",
  cancelled: "danger",
};

export const requestPriorityLabels: Record<RequestPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Crítica",
};

export const requestPriorityTones: Record<RequestPriority, BadgeTone> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
};
