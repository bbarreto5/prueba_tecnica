export type CompanyStatus = "active" | "inactive";

export interface CompanyOverview {
  id: string;
  name: string;
  usersCount: number;
  openRequestsCount: number;
  status: CompanyStatus;
}
