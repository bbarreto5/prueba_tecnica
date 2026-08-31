export type CompanyStatus = "active" | "inactive";

/** Mock-only summary shown on the admin dashboard widget — not the real backend model. */
export interface CompanyOverview {
  id: string;
  name: string;
  usersCount: number;
  openRequestsCount: number;
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
