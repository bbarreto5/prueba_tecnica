import { apiFetch } from "@/lib/api-client";

/** Wire-format DTO — field names match the backend contract exactly (`app/application/companies/schemas.py::CompanyResponse`). */
export interface CompanyResponseBody {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Matches `CompanyCreate` — the backend only accepts `name`; `is_active` defaults to true server-side. */
interface CreateCompanyBody {
  name: string;
}

/** Matches `CompanyUpdate` — both fields optional (partial patch). */
interface UpdateCompanyBody {
  name?: string;
  is_active?: boolean;
}

export function listCompanies(token: string): Promise<CompanyResponseBody[]> {
  return apiFetch<CompanyResponseBody[]>("/companies", { token });
}

export function createCompany(
  token: string,
  data: CreateCompanyBody,
): Promise<CompanyResponseBody> {
  return apiFetch<CompanyResponseBody>("/companies", { method: "POST", token, body: data });
}

export function updateCompany(
  token: string,
  id: string,
  data: UpdateCompanyBody,
): Promise<CompanyResponseBody> {
  return apiFetch<CompanyResponseBody>(`/companies/${id}`, { method: "PATCH", token, body: data });
}
