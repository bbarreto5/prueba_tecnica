import { Badge } from "@/components/Badge";
import { requestStatusLabels, requestStatusTones } from "../lib/labels";
import type { RequestStatus } from "../types";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge tone={requestStatusTones[status]}>{requestStatusLabels[status]}</Badge>
  );
}
