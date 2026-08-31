import type { Company, CompanyOverview } from "@/features/companies/types";
import type { RequestDetail } from "@/features/requests/types";
import type { User } from "@/features/users/types";
import type { DashboardMetric } from "../types";

const UNAVAILABLE = "—";

/**
 * Builds the admin dashboard's metric cards from the three independently
 * fetched resources (`/companies`, `/users`, `/requests`). A `null` source
 * means that fetch failed — its metrics show "—" instead of a fabricated
 * number, and the other sources' metrics are unaffected.
 */
export function buildAdminMetrics(
  companies: Company[] | null,
  users: User[] | null,
  requests: RequestDetail[] | null,
): DashboardMetric[] {
  const requestsUnavailableHint = "No pudimos cargar las solicitudes.";

  const openCount = requests?.filter(
    (request) => request.status === "pending" || request.status === "in_progress",
  ).length;
  const pendingCount = requests?.filter((request) => request.status === "pending").length;
  const resolvedCount = requests?.filter((request) => request.status === "resolved").length;
  const urgentCount = requests?.filter((request) => request.priority === "urgent").length;

  return [
    {
      label: "Empresas",
      value: companies ? companies.length : UNAVAILABLE,
      hint: companies ? undefined : "No pudimos cargar las empresas.",
    },
    {
      label: "Usuarios registrados",
      value: users ? users.length : UNAVAILABLE,
      hint: users ? undefined : "No pudimos cargar los usuarios.",
    },
    {
      label: "Solicitudes abiertas",
      value: requests ? (openCount as number) : UNAVAILABLE,
      hint: requests ? undefined : requestsUnavailableHint,
    },
    {
      label: "Solicitudes pendientes",
      value: requests ? (pendingCount as number) : UNAVAILABLE,
      hint: requests ? undefined : requestsUnavailableHint,
    },
    {
      label: "Solicitudes resueltas",
      value: requests ? (resolvedCount as number) : UNAVAILABLE,
      hint: requests ? undefined : requestsUnavailableHint,
    },
    {
      label: "Prioridad crítica",
      value: requests ? (urgentCount as number) : UNAVAILABLE,
      hint: requests ? "Requieren atención inmediata" : requestsUnavailableHint,
    },
  ];
}

/**
 * Builds the support dashboard's metric cards from the same `/requests`
 * source ADMIN uses (SUPPORT sees every request — see
 * `app/application/requests/get_requests.py`) plus the current user's own
 * id, to split out "my" workload from the global counts.
 */
export function buildSupportMetrics(
  requests: RequestDetail[] | null,
  currentUserId: string,
): DashboardMetric[] {
  const unavailableHint = "No pudimos cargar las solicitudes.";

  if (!requests) {
    return [
      { label: "Asignadas a mí", value: UNAVAILABLE, hint: unavailableHint },
      { label: "Pendientes", value: UNAVAILABLE, hint: unavailableHint },
      { label: "En progreso", value: UNAVAILABLE, hint: unavailableHint },
      { label: "Resueltas", value: UNAVAILABLE, hint: unavailableHint },
      { label: "Prioridad alta", value: UNAVAILABLE, hint: unavailableHint },
      { label: "Resueltas por mí", value: UNAVAILABLE, hint: unavailableHint },
    ];
  }

  const assignedToMe = requests.filter(
    (request) => request.assignedTo === currentUserId && request.status === "in_progress",
  ).length;
  const pending = requests.filter((request) => request.status === "pending").length;
  const inProgress = requests.filter((request) => request.status === "in_progress").length;
  const resolved = requests.filter((request) => request.status === "resolved").length;
  const highPriority = requests.filter((request) => request.priority === "high").length;
  const resolvedByMe = requests.filter(
    (request) => request.assignedTo === currentUserId && request.status === "resolved",
  ).length;

  return [
    { label: "Asignadas a mí", value: assignedToMe },
    { label: "Pendientes", value: pending },
    { label: "En progreso", value: inProgress },
    { label: "Resueltas", value: resolved },
    { label: "Prioridad alta", value: highPriority },
    { label: "Resueltas por mí", value: resolvedByMe },
  ];
}

/**
 * Builds the company dashboard's metric cards from `/requests` — already
 * scoped server-side to the caller's own company for a COMPANY-role user
 * (see `app/application/requests/get_requests.py`), so no company id or
 * extra filtering is needed here.
 */
export function buildCompanyMetrics(requests: RequestDetail[] | null): DashboardMetric[] {
  const unavailableHint = "No pudimos cargar las solicitudes.";

  if (!requests) {
    return [
      { label: "Solicitudes abiertas", value: UNAVAILABLE, hint: unavailableHint },
      { label: "En progreso", value: UNAVAILABLE, hint: unavailableHint },
      { label: "Resueltas", value: UNAVAILABLE, hint: unavailableHint },
      { label: "Incidencias pendientes", value: UNAVAILABLE, hint: unavailableHint },
    ];
  }

  const open = requests.filter((request) => request.status === "pending").length;
  const inProgress = requests.filter((request) => request.status === "in_progress").length;
  const resolved = requests.filter((request) => request.status === "resolved").length;
  const pendingIncidents = requests.filter(
    (request) => request.status === "pending" && request.category === "incident",
  ).length;

  return [
    { label: "Solicitudes abiertas", value: open },
    { label: "En progreso", value: inProgress },
    { label: "Resueltas", value: resolved },
    { label: "Incidencias pendientes", value: pendingIncidents },
  ];
}

/**
 * Derives the per-company overview row from real data. `Company` has no
 * usersCount/openRequestsCount/status fields of its own — these are computed
 * locally from the users/requests lists already fetched for the metrics
 * above (no extra requests). See `CompanyOverview` for the `null` contract.
 */
export function buildCompanyOverview(
  companies: Company[],
  users: User[] | null,
  requests: RequestDetail[] | null,
): CompanyOverview[] {
  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    usersCount: users ? users.filter((user) => user.companyId === company.id).length : null,
    openRequestsCount: requests
      ? requests.filter(
          (request) =>
            request.companyId === company.id &&
            (request.status === "pending" || request.status === "in_progress"),
        ).length
      : null,
    status: company.isActive ? "active" : "inactive",
  }));
}
