import { Badge } from "@/components/Badge";
import { companyStatusLabels, companyStatusTones } from "../lib/labels";
import type { CompanyStatus } from "../types";

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <Badge tone={companyStatusTones[status]}>{companyStatusLabels[status]}</Badge>
  );
}
