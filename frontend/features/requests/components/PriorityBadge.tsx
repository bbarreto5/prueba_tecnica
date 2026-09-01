import { Badge } from "@/components/Badge";
import { requestPriorityLabels, requestPriorityTones } from "../lib/labels";
import type { RequestPriority } from "../types";

export function PriorityBadge({
  priority,
  size,
}: {
  priority: RequestPriority;
  size?: "sm" | "md";
}) {
  return (
    <Badge tone={requestPriorityTones[priority]} size={size} pulse={priority === "urgent"}>
      {requestPriorityLabels[priority]}
    </Badge>
  );
}
