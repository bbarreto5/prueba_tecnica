import type { Metadata } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardSection } from "@/components/DashboardSection";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireAnyRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { getCompanies } from "@/features/companies/lib/queries";
import { RequestActions } from "@/features/requests/components/RequestActions";
import { RequestTable } from "@/features/requests/components/RequestTable";
import {
  resolveRequestAction,
  returnRequestAction,
  takeRequestAction,
} from "@/features/requests/lib/actions";
import { getRequestCapabilities } from "@/features/requests/lib/permissions";
import { getRequests } from "@/features/requests/lib/queries";
import type { RequestDetail } from "@/features/requests/types";
import { getUsers } from "@/features/users/lib/queries";
import { roleRedirectPath } from "@/types/role";

export const metadata: Metadata = {
  title: "Solicitudes",
};

export default async function AdminRequestsPage() {
  const user = await requireAnyRole(["admin", "support"]);

  const navItems: SidebarNavItem[] = [
    { label: "Dashboard", href: roleRedirectPath[user.role] },
    { label: "Empresas", href: "/admin/companies" },
    { label: "Usuarios", href: "/admin/users" },
    { label: "Solicitudes", href: "/admin/requests", current: true },
  ];

  let requests: RequestDetail[] = [];
  let loadError = false;
  try {
    requests = await getRequests();
  } catch {
    loadError = true;
  }

  // Best-effort id→name resolution: ADMIN/SUPPORT already have access to
  // GET /companies and GET /users (same as /admin/companies, /admin/users),
  // so this reuses those existing services rather than inventing new ones.
  // Company/requester/assignee stay blank if either lookup fails.
  let companyNames = new Map<string, string>();
  let userNames = new Map<string, string>();
  try {
    const companies = await getCompanies();
    companyNames = new Map(companies.map((company) => [company.id, company.name]));
  } catch {
    // Falls back to blank company names below.
  }
  try {
    const users = await getUsers();
    userNames = new Map(users.map((u) => [u.id, u.name]));
  } catch {
    // Falls back to blank requester/assignee names below.
  }

  const enrichedRequests = requests.map((request) => ({
    ...request,
    companyName: companyNames.get(request.companyId),
    requesterName: userNames.get(request.createdBy),
    assigneeName: request.assignedTo
      ? (request.assignedTo === user.id ? "Tú" : userNames.get(request.assignedTo))
      : null,
  }));

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Solicitudes"
      description="Todas las solicitudes e incidencias registradas en la plataforma."
    >
      {loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No pudimos cargar las solicitudes</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            Ocurrió un problema al conectar con el servidor. Intenta nuevamente.
          </p>
          <Link
            href="/admin/requests"
            className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90"
          >
            Reintentar
          </Link>
        </div>
      ) : enrichedRequests.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No hay solicitudes</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            No hay solicitudes registradas en la plataforma todavía.
          </p>
        </div>
      ) : (
        <DashboardSection
          title="Todas las solicitudes"
          description="Solicitudes e incidencias de todas las empresas."
        >
          <RequestTable
            requests={enrichedRequests}
            columns={["company", "requester", "assignee", "updatedAt"]}
            detailHref={(request) => `/admin/requests/${request.id}`}
            renderActions={(request) => {
              const { canTake, canReturn, canResolve } = getRequestCapabilities(request, user);
              return (
                <RequestActions
                  requestId={request.id}
                  canTake={canTake}
                  canReturn={canReturn}
                  canResolve={canResolve}
                  takeAction={takeRequestAction}
                  returnAction={returnRequestAction}
                  resolveAction={resolveRequestAction}
                />
              );
            }}
          />
        </DashboardSection>
      )}
    </DashboardLayout>
  );
}
