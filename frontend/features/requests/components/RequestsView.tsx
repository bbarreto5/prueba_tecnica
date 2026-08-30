import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import type { DashboardMetric } from "@/features/dashboard/types";
import { RequestFilters } from "./RequestFilters";
import { RequestTable } from "./RequestTable";
import { RequestsEmptyState } from "./RequestsEmptyState";
import type { RequestSummary } from "../types";

interface RequestsViewProps {
  requests: RequestSummary[];
  metrics: DashboardMetric[];
  companyOptions: string[];
  assigneeOptions: string[];
}

export function RequestsView({
  requests,
  metrics,
  companyOptions,
  assigneeOptions,
}: RequestsViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <RequestFilters companyOptions={companyOptions} assigneeOptions={assigneeOptions} />

      {requests.length === 0 ? (
        <RequestsEmptyState />
      ) : (
        <DashboardSection
          title="Todas las solicitudes"
          description="Solicitudes e incidencias registradas en la plataforma."
        >
          <RequestTable
            requests={requests}
            columns={["company", "requester", "assignee", "updatedAt"]}
            titleColumnLabel="Asunto"
          />
        </DashboardSection>
      )}
    </>
  );
}
