import type { Metadata } from "next";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import { CompanyOverviewList } from "@/features/companies/components/CompanyOverviewList";
import { mockCompanies } from "@/features/companies/mocks/companies";
import { adminMetrics } from "@/features/dashboard/mocks/metrics";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { recentRequests } from "@/features/requests/mocks/requests";
import type { SidebarNavItem } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Panel de administración",
};

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/admin", current: true },
  { label: "Empresas", href: "/admin/companies" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Solicitudes", href: "#" },
];

export default async function AdminDashboardPage() {
  const user = await requireRole("admin");

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Panel de administración"
      description="Visión global de empresas, usuarios y solicitudes en la plataforma."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <DashboardSection
        title="Solicitudes recientes"
        description="Últimas solicitudes registradas en el sistema."
      >
        <RequestTable
          requests={recentRequests}
          columns={["company", "requester", "assignee"]}
          titleColumnLabel="Título"
        />
      </DashboardSection>

      <DashboardSection
        title="Empresas"
        description="Resumen de empresas activas en la plataforma."
      >
        <CompanyOverviewList companies={mockCompanies} />
      </DashboardSection>
    </DashboardLayout>
  );
}
