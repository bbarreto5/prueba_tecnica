import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { SidebarNavItem } from "@/components/Sidebar";
import { RequestsView } from "@/features/requests/components/RequestsView";
import { createRequestAction } from "@/features/requests/lib/actions";
import { getRequests } from "@/features/requests/lib/queries";
import type { RequestDetail } from "@/features/requests/types";

export const metadata: Metadata = {
  title: "Solicitudes",
};

const navItems: SidebarNavItem[] = [
  { label: "Solicitudes", href: "/requests", current: true },
];

export default async function RequestsPage() {
  const user = await requireRole("user");

  let requests: RequestDetail[] = [];
  let loadError = false;
  try {
    requests = await getRequests();
  } catch {
    loadError = true;
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Solicitudes"
      description="Consulta y da seguimiento a las solicitudes e incidencias registradas."
    >
      {loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No pudimos cargar tus solicitudes</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            Ocurrió un problema al conectar con el servidor. Intenta nuevamente.
          </p>
          <Link
            href="/requests"
            className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90"
          >
            Reintentar
          </Link>
        </div>
      ) : (
        <RequestsView initialRequests={requests} createAction={createRequestAction} />
      )}
    </DashboardLayout>
  );
}
