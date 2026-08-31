import type { Metadata } from "next";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { Button } from "@/components/Button";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { SidebarNavItem } from "@/components/Sidebar";
import { mockCompanies } from "@/features/companies/mocks/companies";
import { RequestsView } from "@/features/requests/components/RequestsView";
import { requestsOverviewMetrics } from "@/features/requests/mocks/metrics";
import { assigneeNames, mockRequests } from "@/features/requests/mocks/requests";

export const metadata: Metadata = {
  title: "Solicitudes",
};

const navItems: SidebarNavItem[] = [
  { label: "Solicitudes", href: "/requests", current: true },
];

export default async function RequestsPage() {
  const user = await requireRole("user");

  const companyOptions = mockCompanies.map((company) => company.name);

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Solicitudes"
      description="Consulta y da seguimiento a las solicitudes e incidencias registradas."
      headerActions={<Button variant="primary">+ Nueva solicitud</Button>}
    >
      <RequestsView
        requests={mockRequests}
        metrics={requestsOverviewMetrics}
        companyOptions={companyOptions}
        assigneeOptions={assigneeNames}
      />
    </DashboardLayout>
  );
}
