export type RequestPriority = "low" | "medium" | "high" | "urgent";

export type RequestStatus = "pending" | "in_progress" | "resolved" | "cancelled";

export type RequestCategory = "incident" | "question" | "request";

export interface RequestSummary {
  id: string;
  title: string;
  /** Only known when resolved from mock/dashboard data — the real detail/list flow doesn't resolve company/requester/assignee names (see AGENTS notes in mappers.ts). */
  companyName?: string;
  requesterName?: string;
  assigneeName?: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestDetail extends RequestSummary {
  description: string;
  category: RequestCategory;
  /** Real backend-only fields, needed to derive "is this mine" / "who's it assigned to" without inventing names. */
  companyId: string;
  createdBy: string;
  assignedTo: string | null;
  resolvedAt: string | null;
}

export interface ActivityEvent {
  id: string;
  description: string;
  timestamp: string;
}

export interface Message {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}
