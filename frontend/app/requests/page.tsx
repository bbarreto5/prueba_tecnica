import type { Metadata } from "next";
import { requireUser } from "@/features/auth/lib/currentUser";
import { Button } from "@/components/Button";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { SidebarNavItem } from "@/components/Sidebar";
import { mockCompanies } from "@/features/companies/mocks/companies";
import { RequestsView } from "@/features/requests/components/RequestsView";
import { requestsOverviewMetrics } from "@/features/requests/mocks/metrics";
import { assigneeNames, mockRequests } from "@/features/requests/mocks/requests";
import { roleLabels } from "@/types/role";

export const metadata: Metadata = {
  title: "Solicitudes",
};

const navItems: SidebarNavItem[] = [
  { label: "Solicitudes", href: "/requests", current: true },
];

export default async function RequestsPage() {
  await requireUser();

  const companyOptions = mockCompanies.map((company) => company.name);

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel={roleLabels.user}
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
