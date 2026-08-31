import type { Metadata } from "next";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { SidebarNavItem } from "@/components/Sidebar";
import { logoutAction } from "@/features/auth/lib/actions";
import { requireAnyRole, toSidebarUser } from "@/features/auth/lib/currentUser";
import { createCompanyAction, updateCompanyAction } from "@/features/companies/lib/actions";
import { getCompanies } from "@/features/companies/lib/queries";
import { CompanyView } from "@/features/companies/components/CompanyView";
import type { Company } from "@/features/companies/types";
import { roleRedirectPath } from "@/types/role";

export const metadata: Metadata = {
  title: "Empresas",
};

export default async function AdminCompaniesPage() {
  const user = await requireAnyRole(["admin", "support"]);

  const navItems: SidebarNavItem[] = [
    { label: "Dashboard", href: roleRedirectPath[user.role] },
    { label: "Empresas", href: "/admin/companies", current: true },
    { label: "Usuarios", href: "/admin/users" },
    { label: "Solicitudes", href: "/admin/requests" },
  ];

  let companies: Company[] = [];
  let loadError = false;
  try {
    companies = await getCompanies();
  } catch {
    loadError = true;
  }

  return (
    <DashboardLayout
      navItems={navItems}
      user={toSidebarUser(user)}
      logoutAction={logoutAction}
      title="Empresas"
      description="Gestiona las empresas registradas en la plataforma."
    >
      {loadError ? (
        <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-[#e5e5e5] bg-white px-6 py-16 text-center">
          <p className="text-base font-bold text-[#101828]">No pudimos cargar las empresas</p>
          <p className="max-w-sm text-sm text-[#6a7282]">
            Ocurrió un problema al conectar con el servidor. Intenta nuevamente.
          </p>
          <Link
            href="/admin/companies"
            className="mt-2 rounded-[2rem] bg-[#ff8b1a] px-5 py-2.5 text-sm font-semibold text-[#101828] transition-opacity hover:opacity-90"
          >
            Reintentar
          </Link>
        </div>
      ) : (
        <CompanyView
          initialCompanies={companies}
          createAction={createCompanyAction}
          updateAction={updateCompanyAction}
        />
      )}
    </DashboardLayout>
  );
}
