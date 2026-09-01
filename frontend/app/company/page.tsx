import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import { companyNavItems } from "@/features/auth/lib/companyNav";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { buildCompanyMetrics } from "@/features/dashboard/lib/metrics";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { getRequests } from "@/features/requests/lib/queries";
import type { RequestDetail } from "@/features/requests/types";

export const metadata: Metadata = {
  title: "Panel de empresa",
};

const navItems = companyNavItems("dashboard");

const RECENT_REQUESTS_LIMIT = 5;

export default async function CompanyDashboardPage() {
  const user = await requireRole("company");

  let requests: RequestDetail[] | null = null;
  let loadError = false;
  try {
    requests = await getRequests();
  } catch {
    loadError = true;
  }

  const metrics = buildCompanyMetrics(requests);
  // getRequests() already sorts newest-created-first — the first N are the most recent.
  const recentRequests = (requests ?? []).slice(0, RECENT_REQUESTS_LIMIT);

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Panel de empresa"
      description="Qué está pasando con tus solicitudes."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <DashboardSection title="Solicitudes recientes">
        {loadError ? (
          <p className="text-sm text-[#6a7282]">
            No pudimos cargar las solicitudes. Intenta recargar la página.
          </p>
        ) : recentRequests.length === 0 ? (
          <p className="text-sm text-[#6a7282]">No hay solicitudes registradas todavía.</p>
        ) : (
          <RequestTable
            requests={recentRequests}
            columns={["updatedAt"]}
            titleColumnLabel="Título"
            linkToDetail={false}
          />
        )}
      </DashboardSection>
    </DashboardLayout>
  );
}
