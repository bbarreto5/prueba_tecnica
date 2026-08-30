import type { Metadata } from "next";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import { MetricCard } from "@/components/MetricCard";
import { companyMetrics } from "@/features/dashboard/mocks/metrics";
import { RecentActivityFeed } from "@/features/requests/components/RecentActivityFeed";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { acmeCorpActivity } from "@/features/requests/mocks/activity";
import { acmeCorpRequests } from "@/features/requests/mocks/requests";
import { roleLabels } from "@/types/role";
import type { SidebarNavItem } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Panel de empresa",
};

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/company", current: true },
  { label: "Mis solicitudes", href: "#" },
];

export default function CompanyDashboardPage() {
  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel={roleLabels.company}
      title="Panel de Acme Corp"
      description="Qué está pasando con tus solicitudes."
      ctaLabel="Crear solicitud"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {companyMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardSection title="Solicitudes recientes">
            <RequestTable
              requests={acmeCorpRequests}
              columns={["updatedAt"]}
              titleColumnLabel="Título"
            />
          </DashboardSection>
        </div>

        <DashboardSection title="Actividad reciente">
          <RecentActivityFeed events={acmeCorpActivity} />
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}
