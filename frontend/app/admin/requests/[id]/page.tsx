import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireAnyRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { getCompanies } from "@/features/companies/lib/queries";
import { PriorityBadge } from "@/features/requests/components/PriorityBadge";
import { RequestActions } from "@/features/requests/components/RequestActions";
import { RequestMessages } from "@/features/requests/components/RequestMessages";
import { ReturnToQueueAction } from "@/features/requests/components/ReturnToQueueAction";
import { StatusBadge } from "@/features/requests/components/StatusBadge";
import {
  resolveRequestAction,
  returnRequestAction,
  sendMessageAction,
  takeRequestAction,
} from "@/features/requests/lib/actions";
import { requestCategoryLabels } from "@/features/requests/lib/labels";
import { getRequestCapabilities } from "@/features/requests/lib/permissions";
import { getRequestDetail, getRequestMessages } from "@/features/requests/lib/queries";
import type { Message, RequestDetail } from "@/features/requests/types";
import { getUsers } from "@/features/users/lib/queries";
import { ApiError } from "@/lib/api-client";
import { roleRedirectPath } from "@/types/role";

export async function generateMetadata({
  params,
}: PageProps<"/admin/requests/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const request = await getRequestDetail(id);
    return { title: request ? `${request.id} · ${request.title}` : "Solicitud" };
  } catch {
    return { title: "Solicitud" };
  }
}

export default async function AdminRequestDetailPage({
  params,
}: PageProps<"/admin/requests/[id]">) {
  const user = await requireAnyRole(["admin", "support"]);
  const { id } = await params;

  const navItems: SidebarNavItem[] = [
    { label: "Dashboard", href: roleRedirectPath[user.role] },
    { label: "Empresas", href: "/admin/companies" },
    { label: "Usuarios", href: "/admin/users" },
    { label: "Solicitudes", href: "/admin/requests", current: true },
  ];

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
            href={`/admin/requests/${id}`}
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

  // Best-effort id→name resolution — same reasoning as the admin requests list.
  let companyName: string | undefined;
  let requesterName: string | undefined;
  try {
    const companies = await getCompanies();
    companyName = companies.find((company) => company.id === request.companyId)?.name;
  } catch {
    // Falls back to the raw id below.
  }
  try {
    const users = await getUsers();
    requesterName = users.find((u) => u.id === request.createdBy)?.name;
  } catch {
    // Falls back to the raw id below.
  }

  const { canTake, canReturn, canResolve, canReply } = getRequestCapabilities(request, user);
  const isClosed = request.status === "resolved" || request.status === "cancelled";
  // See getRequestCapabilities: for SUPPORT, canReply requires being the
  // current assignee (a UX rule, not a backend one); ADMIN keeps the
  // backend's real, unrestricted permission to message any accessible
  // request. This message only ever shows for the SUPPORT-restricted case.
  const messagesDisabledMessage = isClosed
    ? "Esta solicitud está cerrada y ya no admite nuevos mensajes."
    : request.assignedTo === null
      ? "Esta solicitud no está asignada a ti. Tómala para poder responder."
      : "Esta solicitud está asignada a otro agente. Solo el agente asignado puede responder.";

  const infoRows = [
    { label: "Categoría", value: requestCategoryLabels[request.category] },
    { label: "Empresa", value: companyName ?? request.companyId },
    {
      label: "Solicitante",
      value: request.createdBy === user.id ? "Tú" : (requesterName ?? request.createdBy),
    },
    {
      label: "Responsable",
      value:
        request.assignedTo === null
          ? "Sin asignar"
          : request.assignedTo === user.id
            ? "Tú"
            : "Asignada a otro agente",
    },
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
          <PriorityBadge priority={request.priority} />
          <StatusBadge status={request.status} />
        </div>
      }
    >
      <Link
        href="/admin/requests"
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
              canSend={canReply}
              currentUserId={user.id}
              requesterId={request.createdBy}
              assigneeId={request.assignedTo}
              sendAction={sendMessageAction}
              disabledMessage={messagesDisabledMessage}
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
            {!canTake && !canReturn && !canResolve ? (
              <p className="text-sm text-[#6a7282]">
                No hay acciones disponibles para esta solicitud.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {canTake || canResolve ? (
                  <RequestActions
                    requestId={request.id}
                    canTake={canTake}
                    canResolve={canResolve}
                    takeAction={takeRequestAction}
                    resolveAction={resolveRequestAction}
                  />
                ) : null}
                {canReturn ? (
                  <ReturnToQueueAction
                    requestId={request.id}
                    sendMessageAction={sendMessageAction}
                    returnAction={returnRequestAction}
                  />
                ) : null}
              </div>
            )}
          </DashboardSection>
        </div>
      </div>
    </DashboardLayout>
  );
}
