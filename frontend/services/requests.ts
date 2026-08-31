import { apiFetch } from "@/lib/api-client";

export type BackendRequestType = "INCIDENT" | "QUESTION" | "REQUEST";
export type BackendRequestPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type BackendRequestStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";

/** Wire-format DTO — matches `app/application/requests/schemas.py::RequestResponse` exactly. */
export interface RequestResponseBody {
  id: string;
  company_id: string;
  created_by: string;
  assigned_to: string | null;
  title: string;
  description: string;
  type: BackendRequestType;
  priority: BackendRequestPriority;
  status: BackendRequestStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

/** Matches `RequestCreate`. `company_id` is required for ADMIN/SUPPORT (no company of their own) and ignored/auto-assigned for COMPANY/USER. */
interface CreateRequestBody {
  title: string;
  description: string;
  type: BackendRequestType;
  priority: BackendRequestPriority;
  company_id?: string | null;
}

export function listRequests(token: string): Promise<RequestResponseBody[]> {
  return apiFetch<RequestResponseBody[]>("/requests", { token });
}

export function getRequest(token: string, id: string): Promise<RequestResponseBody> {
  return apiFetch<RequestResponseBody>(`/requests/${id}`, { token });
}

export function createRequest(
  token: string,
  data: CreateRequestBody,
): Promise<RequestResponseBody> {
  return apiFetch<RequestResponseBody>("/requests", { method: "POST", token, body: data });
}

export function cancelRequest(token: string, id: string): Promise<RequestResponseBody> {
  return apiFetch<RequestResponseBody>(`/requests/${id}/cancel`, { method: "PATCH", token });
}

export function resolveRequest(token: string, id: string): Promise<RequestResponseBody> {
  return apiFetch<RequestResponseBody>(`/requests/${id}/resolve`, { method: "POST", token });
}
