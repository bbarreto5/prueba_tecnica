import type { CompanyOverview } from "../types";

export const mockCompanies: CompanyOverview[] = [
  {
    id: "company-1",
    name: "Acme Corp",
    usersCount: 42,
    openRequestsCount: 3,
    status: "active",
  },
  {
    id: "company-2",
    name: "Nova Textiles",
    usersCount: 18,
    openRequestsCount: 1,
    status: "active",
  },
  {
    id: "company-3",
    name: "Bluewave Logística",
    usersCount: 27,
    openRequestsCount: 2,
    status: "active",
  },
  {
    id: "company-4",
    name: "Andes Retail",
    usersCount: 15,
    openRequestsCount: 0,
    status: "active",
  },
  {
    id: "company-5",
    name: "Solvex Industrial",
    usersCount: 9,
    openRequestsCount: 2,
    status: "inactive",
  },
  {
    id: "company-6",
    name: "Cronos Salud",
    usersCount: 12,
    openRequestsCount: 1,
    status: "active",
  },
];
