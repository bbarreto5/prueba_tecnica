export type RequestPriority = "low" | "medium" | "high" | "urgent";

export type RequestStatus = "pending" | "in_progress" | "resolved" | "cancelled";

export type RequestCategory = "incident" | "question" | "request";

export interface RequestSummary {
  id: string;
  title: string;
  /**
   * Not part of the wire DTO (see AGENTS notes in mappers.ts) — only ever
   * populated when a caller resolves it separately, e.g. mock/dashboard data,
   * or the admin requests views resolving it via the existing companies/users
   * services (ADMIN/SUPPORT-only, since /requests itself never exposes names).
   */
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

export interface Message {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}
