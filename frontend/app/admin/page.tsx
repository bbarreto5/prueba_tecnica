import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { CompanyOverviewList } from "@/features/companies/components/CompanyOverviewList";
import { getCompanies } from "@/features/companies/lib/queries";
import { buildAdminMetrics, buildCompanyOverview } from "@/features/dashboard/lib/metrics";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { withResolvedNames } from "@/features/requests/lib/mappers";
import { getRequests } from "@/features/requests/lib/queries";
import { getUsers } from "@/features/users/lib/queries";

export const metadata: Metadata = {
  title: "Panel de administración",
};

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/admin", current: true },
  { label: "Empresas", href: "/admin/companies" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Solicitudes", href: "/admin/requests" },
];

const RECENT_REQUESTS_LIMIT = 5;

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");

  const [companiesResult, usersResult, requestsResult] = await Promise.allSettled([
    getCompanies(),
    getUsers(),
    getRequests(),
  ]);

  const companies = companiesResult.status === "fulfilled" ? companiesResult.value : null;
  const users = usersResult.status === "fulfilled" ? usersResult.value : null;
  const requests = requestsResult.status === "fulfilled" ? requestsResult.value : null;

  const metrics = buildAdminMetrics(companies, users, requests);
  const companyOverview = companies ? buildCompanyOverview(companies, users, requests) : [];

  const companyNames = new Map((companies ?? []).map((company) => [company.id, company.name]));
  const userNames = new Map((users ?? []).map((u) => [u.id, u.name]));

  // GET /requests returns oldest-first (see backend repository ordering) — the last N are the most recent.
  const recentRequests = withResolvedNames(
    (requests ?? []).slice(-RECENT_REQUESTS_LIMIT).reverse(),
    companyNames,
    userNames,
    user.id,
  );

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Panel de administración"
      description="Visión global de empresas, usuarios y solicitudes en la plataforma."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <DashboardSection
        title="Solicitudes recientes"
        description="Últimas solicitudes registradas en el sistema."
      >
        {requestsResult.status === "rejected" ? (
          <p className="text-sm text-[#6a7282]">
            No pudimos cargar las solicitudes. Intenta recargar la página.
          </p>
        ) : recentRequests.length === 0 ? (
          <p className="text-sm text-[#6a7282]">No hay solicitudes registradas todavía.</p>
        ) : (
          <RequestTable
            requests={recentRequests}
            columns={["company", "requester", "assignee"]}
            titleColumnLabel="Título"
            detailBasePath="/admin/requests"
          />
        )}
      </DashboardSection>

      <DashboardSection
        title="Empresas"
        description="Resumen de empresas activas en la plataforma."
      >
        {companiesResult.status === "rejected" ? (
          <p className="text-sm text-[#6a7282]">
            No pudimos cargar las empresas. Intenta recargar la página.
          </p>
        ) : companyOverview.length === 0 ? (
          <p className="text-sm text-[#6a7282]">No hay empresas registradas todavía.</p>
        ) : (
          <CompanyOverviewList companies={companyOverview} />
        )}
      </DashboardSection>
    </DashboardLayout>
  );
}
