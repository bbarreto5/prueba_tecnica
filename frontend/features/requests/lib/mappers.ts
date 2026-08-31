import type {
  BackendRequestPriority,
  BackendRequestStatus,
  BackendRequestType,
  RequestResponseBody,
} from "@/services/requests";
import type { MessageResponseBody } from "@/services/messages";
import type { Message, RequestCategory, RequestDetail, RequestPriority, RequestStatus } from "../types";
import { formatDate, formatDateTime } from "./format";

/**
 * The real `RequestResponse`/`MessageResponse` only expose `company_id`,
 * `created_by`, `assigned_to`, `author_id` as raw ids — no names. Resolving
 * them would require calling `GET /users`, which USER-role callers (the
 * only role that can reach `/requests`) get a 403 from. So company/
 * requester/assignee are intentionally NOT resolved to names here; the UI
 * derives "Tú" / "Sin asignar" style labels from these ids at render time
 * instead (see RequestActions/RequestMessages), never inventing a name.
 * ADMIN/SUPPORT views *do* have access to `GET /companies` and `GET /users`
 * (see `withResolvedNames` below) and resolve real names best-effort.
 */

const typeToCategory: Record<BackendRequestType, RequestCategory> = {
  INCIDENT: "incident",
  QUESTION: "question",
  REQUEST: "request",
};

const categoryToType: Record<RequestCategory, BackendRequestType> = {
  incident: "INCIDENT",
  question: "QUESTION",
  request: "REQUEST",
};

const priorityMap: Record<BackendRequestPriority, RequestPriority> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const priorityToBackend: Record<RequestPriority, BackendRequestPriority> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  urgent: "URGENT",
};

const statusMap: Record<BackendRequestStatus, RequestStatus> = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CANCELLED: "cancelled",
};

export function mapCategoryToBackend(category: RequestCategory): BackendRequestType {
  return categoryToType[category];
}

export function mapPriorityToBackend(priority: RequestPriority): BackendRequestPriority {
  return priorityToBackend[priority];
}

export function toRequestDetail(dto: RequestResponseBody): RequestDetail {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    category: typeToCategory[dto.type],
    priority: priorityMap[dto.priority],
    status: statusMap[dto.status],
    createdAt: formatDate(dto.created_at),
    updatedAt: formatDate(dto.updated_at),
    resolvedAt: dto.resolved_at ? formatDate(dto.resolved_at) : null,
    companyId: dto.company_id,
    createdBy: dto.created_by,
    assignedTo: dto.assigned_to,
  };
}

export function toMessage(dto: MessageResponseBody): Message {
  return {
    id: dto.id,
    authorId: dto.author_id,
    content: dto.content,
    createdAt: formatDateTime(dto.created_at),
  };
}

/**
 * Fills in `companyName`/`requesterName`/`assigneeName` on ADMIN/SUPPORT
 * views (the public `/requests` view never calls this — see the note atop
 * this file). `companyNames`/`userNames` come from the caller's own
 * `GET /companies`/`GET /users` fetch; a request whose id isn't in the map
 * (that fetch failed, or the record was deleted) simply renders blank
 * rather than guessing — never inventing a name.
 */
export function withResolvedNames(
  requests: RequestDetail[],
  companyNames: Map<string, string>,
  userNames: Map<string, string>,
  currentUserId: string,
): RequestDetail[] {
  return requests.map((request) => ({
    ...request,
    companyName: companyNames.get(request.companyId),
    requesterName: userNames.get(request.createdBy),
    assigneeName: request.assignedTo
      ? request.assignedTo === currentUserId
        ? "Tú"
        : userNames.get(request.assignedTo)
      : null,
  }));
}
