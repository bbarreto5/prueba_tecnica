import type { Metadata } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { UsersView } from "@/features/users/components/UsersView";
import { createUserAction, updateUserAction } from "@/features/users/lib/actions";
import { getAssignableRoles } from "@/features/users/lib/permissions";
import { getUsers } from "@/features/users/lib/queries";
import type { User } from "@/features/users/types";

export const metadata: Metadata = {
  title: "Usuarios",
};

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", href: "/company" },
  { label: "Usuarios", href: "/company/users", current: true },
  { label: "Mis solicitudes", href: "#" },
];

export default async function CompanyUsersPage() {
  const user = await requireRole("company");

  let users: User[] = [];
  let loadError = false;
  try {
    users = await getUsers();
  } catch {
    loadError = true;
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Usuarios"
      description="Gestiona los usuarios de tu compañía."
    >
      {loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No pudimos cargar los usuarios</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            Ocurrió un problema al conectar con el servidor. Intenta nuevamente.
          </p>
          <Link
            href="/company/users"
            className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90"
          >
            Reintentar
          </Link>
        </div>
      ) : (
        <UsersView
          initialUsers={users}
          assignableRoles={getAssignableRoles(user.role)}
          showCompanyField={false}
          showCompanyColumn={false}
          createAction={createUserAction}
          updateAction={updateUserAction}
        />
      )}
    </DashboardLayout>
  );
}
