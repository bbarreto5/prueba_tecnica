import type { Metadata } from "next";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import { supportMetrics } from "@/features/dashboard/mocks/metrics";
import { RequestTable } from "@/features/requests/components/RequestTable";
import {
  openWorkQueueRequests,
  priorityQueueRequests,
} from "@/features/requests/mocks/requests";
import type { SidebarNavItem } from "@/components/Sidebar";

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

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Panel de soporte"
      description="Qué tienes pendiente y qué deberías atender primero."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {supportMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <DashboardSection
        title="Solicitudes prioritarias"
        description="Prioridad alta y crítica que requieren atención inmediata."
      >
        <RequestTable requests={priorityQueueRequests} columns={["company", "assignee"]} />
      </DashboardSection>

      <DashboardSection
        title="Cola de trabajo"
        description="Todas las solicitudes pendientes y en progreso."
      >
        <RequestTable requests={openWorkQueueRequests} columns={["company", "assignee"]} />
      </DashboardSection>
    </DashboardLayout>
  );
}
