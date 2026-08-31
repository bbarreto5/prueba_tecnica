import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { getCompanies } from "@/features/companies/lib/queries";
import { buildSupportMetrics } from "@/features/dashboard/lib/metrics";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { withResolvedNames } from "@/features/requests/lib/mappers";
import { getRequests } from "@/features/requests/lib/queries";
import { getUsers } from "@/features/users/lib/queries";

export const metadata: Metadata = {
  title: "Panel de soporte",
};

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/support", current: true },
  { label: "Empresas", href: "/admin/companies" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Solicitudes", href: "/admin/requests" },
];

export default async function SupportDashboardPage() {
  const user = await requireRole("support");

  const [companiesResult, usersResult, requestsResult] = await Promise.allSettled([
    getCompanies(),
    getUsers(),
    getRequests(),
  ]);

  const companies = companiesResult.status === "fulfilled" ? companiesResult.value : null;
  const users = usersResult.status === "fulfilled" ? usersResult.value : null;
  const requests = requestsResult.status === "fulfilled" ? requestsResult.value : null;

  const metrics = buildSupportMetrics(requests, user.id);

  const companyNames = new Map((companies ?? []).map((company) => [company.id, company.name]));
  const userNames = new Map((users ?? []).map((u) => [u.id, u.name]));
  
  const openRequests = (requests ?? []).filter(
    (request) => request.status === "pending" || request.status === "in_progress",
  );
  const priorityRequests = openRequests.filter(
    (request) => request.priority === "high" || request.priority === "urgent",
  );


  const enrichedOpenRequests = withResolvedNames(openRequests, companyNames, userNames, user.id);
  const enrichedPriorityRequests = withResolvedNames(
    priorityRequests,
    companyNames,
    userNames,
    user.id,
  );

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Panel de soporte"
      description="Qué tienes pendiente y qué deberías atender primero."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <DashboardSection
        title="Solicitudes prioritarias"
        description="Prioridad alta y crítica que requieren atención inmediata."
      >
        {requestsResult.status === "rejected" ? (
          <p className="text-sm text-[#6a7282]">
            No pudimos cargar las solicitudes. Intenta recargar la página.
          </p>
        ) : enrichedPriorityRequests.length === 0 ? (
          <p className="text-sm text-[#6a7282]">
            No hay solicitudes prioritarias en este momento.
          </p>
        ) : (
          <RequestTable
            requests={enrichedPriorityRequests}
            columns={["company", "assignee"]}
            detailBasePath="/admin/requests"
          />
        )}
      </DashboardSection>

      <DashboardSection
        title="Cola de trabajo"
        description="Todas las solicitudes pendientes y en progreso."
      >
        {requestsResult.status === "rejected" ? (
          <p className="text-sm text-[#6a7282]">
            No pudimos cargar las solicitudes. Intenta recargar la página.
          </p>
        ) : enrichedOpenRequests.length === 0 ? (
          <p className="text-sm text-[#6a7282]">No hay solicitudes pendientes ni en progreso.</p>
        ) : (
          <RequestTable
            requests={enrichedOpenRequests}
            columns={["company", "assignee"]}
            detailBasePath="/admin/requests"
          />
        )}
      </DashboardSection>
    </DashboardLayout>
  );
}
