import { Badge } from "@/components/Badge";
import { requestPriorityLabels, requestPriorityTones } from "../lib/labels";
import type { RequestPriority } from "../types";

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  return (
    <Badge tone={requestPriorityTones[priority]}>
      {requestPriorityLabels[priority]}
    </Badge>
  );
}
