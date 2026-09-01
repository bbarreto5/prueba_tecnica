import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { companyNavItems } from "@/features/auth/lib/companyNav";
import { requireAnyRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { PriorityBadge } from "@/features/requests/components/PriorityBadge";
import { RequestActions } from "@/features/requests/components/RequestActions";
import { RequestMessages } from "@/features/requests/components/RequestMessages";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import {
  cancelRequestAction,
  resolveRequestAction,
  sendMessageAction,
} from "@/features/requests/lib/actions";
import { requestCategoryLabels } from "@/features/requests/lib/labels";
import { getRequestDetail, getRequestMessages } from "@/features/requests/lib/queries";
import type { Message, RequestDetail } from "@/features/requests/types";
import { ApiError } from "@/lib/api-client";

const userNavItems: SidebarNavItem[] = [
  { label: "Solicitudes", href: "/requests", current: true },
];

export async function generateMetadata({
  params,
}: PageProps<"/requests/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const request = await getRequestDetail(id);
    return { title: request ? `${request.id} · ${request.title}` : "Solicitud" };
  } catch {
    return { title: "Solicitud" };
  }
}

export default async function RequestDetailPage({ params }: PageProps<"/requests/[id]">) {
  const user = await requireAnyRole(["company", "user"]);
  const navItems = user.role === "company" ? companyNavItems("requests") : userNavItems;
  const { id } = await params;

  let request: RequestDetail | null;
  try {
    request = await getRequestDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <DashboardLayout
        navItems={navItems}
        user={toSidebarUser(user)}
        logoutAction={logoutAction}
        title="Solicitudes"
      >
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No pudimos cargar la solicitud</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            Ocurrió un problema al conectar con el servidor. Intenta nuevamente.
          </p>
          <Link
            href={`/requests/${id}`}
            className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90"
          >
            Reintentar
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (!request) {
    notFound();
  }

  let messages: Message[] = [];
  let messagesLoadError = false;
  try {
    messages = await getRequestMessages(id);
  } catch {
    messagesLoadError = true;
  }

  const canCancel = request.status === "pending" || request.status === "in_progress";
  const canResolve =
    (user.role === "admin" || user.role === "support") && request.status === "in_progress";
  const canSendMessage = request.status !== "resolved" && request.status !== "cancelled";

  const infoRows = [
    { label: "Categoría", value: requestCategoryLabels[request.category] },
    {
      label: "Solicitante",
      value: request.createdBy === user.id ? "Tú" : "Otro miembro de tu compañía",
    },
    { label: "Responsable", value: request.assignedTo ? "Asignada a soporte" : "Sin asignar" },
    { label: "Fecha de creación", value: request.createdAt },
    { label: "Última actualización", value: request.updatedAt },
    ...(request.resolvedAt ? [{ label: "Fecha de resolución", value: request.resolvedAt }] : []),
  ];

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title={request.title}
      description={`${request.id} · Creada el ${request.createdAt}`}
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={request.priority} size="md" />
          <StatusBadge status={request.status} size="md" />
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
            <RequestMessages
              requestId={request.id}
              initialMessages={messages}
              loadError={messagesLoadError}
              canSend={canSendMessage}
              currentUserId={user.id}
              requesterId={request.createdBy}
              assigneeId={request.assignedTo}
              sendAction={sendMessageAction}
            />
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
            <RequestActions
              requestId={request.id}
              canCancel={canCancel}
              canResolve={canResolve}
              cancelAction={cancelRequestAction}
              resolveAction={resolveRequestAction}
            />
          </DashboardSection>
        </div>
      </div>
    </DashboardLayout>
  );
}
