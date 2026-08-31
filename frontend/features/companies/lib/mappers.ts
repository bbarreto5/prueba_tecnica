import type { CompanyResponseBody } from "@/services/companies";
import type { Company } from "../types";

export function toCompany(dto: CompanyResponseBody): Company {
  return {
    id: dto.id,
    name: dto.name,
    isActive: dto.is_active,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}
