import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import { userMetrics } from "@/features/dashboard/mocks/metrics";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { mariaGomezRequests } from "@/features/requests/mocks/requests";
import { roleLabels } from "@/types/role";
import type { SidebarNavItem } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Mis solicitudes",
};

const navItems: SidebarNavItem[] = [
  { label: "Mis solicitudes", href: "/requests", current: true },
];

export default function RequestsPage() {
  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel={roleLabels.user}
      title="Mis solicitudes"
      description="Consulta el estado de tus solicitudes de soporte."
      ctaLabel="Crear solicitud"
      headerActions={
        <button
          type="button"
          className="rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          + Crear solicitud
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {userMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <DashboardSection title="Mis solicitudes">
        <RequestTable requests={mariaGomezRequests} columns={["updatedAt"]} />
      </DashboardSection>
    </DashboardLayout>
  );
}
