import type { UserResponseBody } from "@/services/users";
import { mapBackendRole } from "@/types/role";
import type { User } from "../types";

export function toUser(dto: UserResponseBody): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: mapBackendRole(dto.role),
    companyId: dto.company_id,
  };
}
