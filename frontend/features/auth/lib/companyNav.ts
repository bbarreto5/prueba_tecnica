import type { SidebarNavItem } from "@/components/Sidebar";

export type CompanySection = "dashboard" | "users" | "requests";

/**
 * Shared nav shape for every page a COMPANY-role user can reach. Kept in one
 * place (instead of a copy per page) since `/company`, `/company/users`, and
 * `/requests`/`/requests/[id]` (COMPANY reuses the same requests view as
 * USER — see `AGENTS.md` note on that decision) all need the identical
 * Dashboard/Usuarios/Mis solicitudes set, differing only in which item is
 * "current".
 */
export function companyNavItems(current: CompanySection): SidebarNavItem[] {
  return [
    { label: "Dashboard", href: "/company", current: current === "dashboard" },
    { label: "Usuarios", href: "/company/users", current: current === "users" },
    { label: "Mis solicitudes", href: "/requests", current: current === "requests" },
  ];
}
