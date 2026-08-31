import type { Role } from "@/types/role";

/**
 * Real user record from the backend (`app/domain/entities/user.py` /
 * `UserResponse`). The response only exposes these fields — no
 * is_active/created_at/updated_at, so none are shown here.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  companyId: string | null;
}

/** Matches `UserCreate` on the backend. */
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
  companyId: string | null;
}

/** Matches `UserUpdate` on the backend — all fields optional (partial patch). */
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  companyId?: string | null;
}
