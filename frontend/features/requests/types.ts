export type RequestPriority = "low" | "medium" | "high" | "urgent";

export type RequestStatus = "pending" | "in_progress" | "resolved" | "cancelled";

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

export interface ActivityEvent {
  id: string;
  description: string;
  timestamp: string;
}
