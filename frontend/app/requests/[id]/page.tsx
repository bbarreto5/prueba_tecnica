import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import type { SidebarNavItem } from "@/components/Sidebar";
import { PriorityBadge } from "@/features/requests/components/PriorityBadge";
import { RequestMessages } from "@/features/requests/components/RequestMessages";
import { RequestTimeline } from "@/features/requests/components/RequestTimeline";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import { requestCategoryLabels } from "@/features/requests/lib/labels";
import { getRequestMessages } from "@/features/requests/mocks/messages";
import { requestDetails, getRequestDetail } from "@/features/requests/mocks/requestDetails";
import { getRequestTimeline } from "@/features/requests/mocks/timeline";
import { roleLabels } from "@/types/role";

const navItems: SidebarNavItem[] = [
  { label: "Solicitudes", href: "/requests", current: true },
];

export function generateStaticParams() {
  return requestDetails.map((request) => ({ id: request.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/requests/[id]">): Promise<Metadata> {
  const { id } = await params;
  const request = getRequestDetail(id);
  return {
    title: request ? `${request.id} · ${request.title}` : "Solicitud no encontrada",
  };
}

export default async function RequestDetailPage({ params }: PageProps<"/requests/[id]">) {
  const { id } = await params;
  const request = getRequestDetail(id);

  if (!request) {
    notFound();
  }

  const messages = getRequestMessages(request.id);
  const timeline = getRequestTimeline(request.id);

  const infoRows = [
    { label: "Empresa", value: request.companyName },
    { label: "Solicitante", value: request.requesterName },
    { label: "Responsable", value: request.assigneeName ?? "Sin asignar" },
    { label: "Categoría", value: requestCategoryLabels[request.category] },
    { label: "Fecha de creación", value: request.createdAt },
    { label: "Última actualización", value: request.updatedAt },
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      roleLabel={roleLabels.user}
      title={request.title}
      description={`${request.id} · Creada el ${request.createdAt}`}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      }
    >
      <Link
        href="/requests"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#6a7282] transition-colors hover:text-[#101828] focus-visible:text-[#101828] focus-visible:outline-none"
      >
        ← Volver a solicitudes
      </Link>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="flex flex-col gap-8 xl:col-span-2">
          <DashboardSection title="Descripción">
            <p className="text-sm leading-relaxed text-[#101828]">{request.description}</p>
          </DashboardSection>

          <DashboardSection
            title="Conversación"
            description="Mensajes entre el solicitante y soporte."
          >
            <RequestMessages messages={messages} />
          </DashboardSection>
        </div>

        <div className="flex flex-col gap-8">
          <DashboardSection title="Información de la solicitud">
            <dl className="flex flex-col gap-4">
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <dt className="text-[#6a7282]">{row.label}</dt>
                  <dd className="font-medium text-[#101828]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </DashboardSection>

          <DashboardSection title="Acciones" description="Disponibles según tu rol.">
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost">Asignar</Button>
              <Button variant="ghost">Cambiar estado</Button>
              <Button variant="ghost">Cambiar prioridad</Button>
              <Button variant="ghost">Cerrar solicitud</Button>
            </div>
          </DashboardSection>

          <DashboardSection title="Actividad">
            <RequestTimeline events={timeline} />
          </DashboardSection>
        </div>
      </div>
    </DashboardLayout>
  );
}
