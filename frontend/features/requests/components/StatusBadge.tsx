import { Badge } from "@/components/Badge";
import { requestStatusLabels, requestStatusTones } from "../lib/labels";
import type { RequestStatus } from "../types";

export function StatusBadge({ status, size }: { status: RequestStatus; size?: "sm" | "md" }) {
  return (
    <Badge tone={requestStatusTones[status]} size={size}>
      {requestStatusLabels[status]}
    </Badge>
  );
}
