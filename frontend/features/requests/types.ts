export type RequestPriority = "low" | "medium" | "high" | "urgent";

export type RequestStatus = "pending" | "in_progress" | "resolved" | "cancelled";

export type RequestCategory = "incident" | "question" | "request";

export interface RequestSummary {
  id: string;
  title: string;
  companyName: string;
  requesterName: string;
  assigneeName: string | null;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RequestDetail extends RequestSummary {
  description: string;
  category: RequestCategory;
}

export interface ActivityEvent {
  id: string;
  description: string;
  timestamp: string;
}

export interface TimelineEvent {
  id: string;
  type: string;
  actor: string;
  description: string;
  timestamp: string;
}

export interface RequestMessage {
  id: string;
  author: string;
  role: "requester" | "support";
  content: string;
  timestamp: string;
}
