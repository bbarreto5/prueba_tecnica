import type { Metadata } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireAnyRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { getCompanies } from "@/features/companies/lib/queries";
import type { Company } from "@/features/companies/types";
import { UsersView } from "@/features/users/components/UsersView";
import { createUserAction, updateUserAction } from "@/features/users/lib/actions";
import { getAssignableRoles } from "@/features/users/lib/permissions";
import { getUsers } from "@/features/users/lib/queries";
import type { User } from "@/features/users/types";
import { roleRedirectPath } from "@/types/role";

export const metadata: Metadata = {
  title: "Usuarios",
};

export default async function AdminUsersPage() {
  const user = await requireAnyRole(["admin", "support"]);

  const navItems: SidebarNavItem[] = [
    { label: "Dashboard", href: roleRedirectPath[user.role] },
    { label: "Empresas", href: "/admin/companies" },
    { label: "Usuarios", href: "/admin/users", current: true },
    { label: "Solicitudes", href: "#" },
  ];

  let users: User[] = [];
  let loadError = false;
  try {
    users = await getUsers();
  } catch {
    loadError = true;
  }

  let companies: Company[] = [];
  let companiesLoadError = false;
  try {
    companies = await getCompanies();
  } catch {
    companiesLoadError = true;
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Usuarios"
      description="Gestiona los usuarios registrados en la plataforma."
    >
      {loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No pudimos cargar los usuarios</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            Ocurrió un problema al conectar con el servidor. Intenta nuevamente.
          </p>
          <Link
            href="/admin/users"
            className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90"
          >
            Reintentar
          </Link>
        </div>
      ) : (
        <UsersView
          initialUsers={users}
          companies={companies}
          companiesLoadError={companiesLoadError}
          assignableRoles={getAssignableRoles(user.role)}
          createAction={createUserAction}
          updateAction={updateUserAction}
        />
      )}
    </DashboardLayout>
  );
}
