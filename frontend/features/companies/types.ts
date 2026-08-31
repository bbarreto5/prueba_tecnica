export type CompanyStatus = "active" | "inactive";

/**
 * Per-company summary row shown on the admin dashboard widget. Not a backend
 * model — `usersCount`/`openRequestsCount` are derived locally from the real
 * `/users` and `/requests` lists (see `features/dashboard/lib/metrics.ts`).
 * `null` means the source list needed to compute it failed to load — never
 * fabricated as `0`, which would be indistinguishable from a real "none".
 */
export interface CompanyOverview {
  id: string;
  name: string;
  usersCount: number | null;
  openRequestsCount: number | null;
  status: CompanyStatus;
}

/**
 * Real company record from the backend (`app/domain/entities/company.py`).
 * Only `name` and `isActive` are editable — the backend model has no other
 * fields (no email/phone/address/document), so none are shown or sent here.
 */
export interface Company {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Matches `CompanyCreate` on the backend: only `name` is accepted. */
export interface CreateCompanyRequest {
  name: string;
}

/** Matches `CompanyUpdate` on the backend: both fields optional. */
export interface UpdateCompanyRequest {
  name?: string;
  isActive?: boolean;
}
