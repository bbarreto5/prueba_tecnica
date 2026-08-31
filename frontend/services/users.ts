import { apiFetch } from "@/lib/api-client";
import type { BackendRole } from "@/types/role";

/** Wire-format DTO — matches `app/application/users/schemas.py::UserResponse` exactly (no is_active/created_at/updated_at — the backend doesn't expose them here). */
export interface UserResponseBody {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  company_id: string | null;
}

/** Matches `UserCreate`. */
interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  role: BackendRole;
  company_id: string | null;
}

/** Matches `UserUpdate` — all fields optional (partial patch). `password` is only sent when the caller wants to change it. */
interface UpdateUserBody {
  name?: string;
  email?: string;
  password?: string;
  role?: BackendRole;
  company_id?: string | null;
}

export function listUsers(token: string): Promise<UserResponseBody[]> {
  return apiFetch<UserResponseBody[]>("/users", { token });
}

export function createUser(token: string, data: CreateUserBody): Promise<UserResponseBody> {
  return apiFetch<UserResponseBody>("/users", { method: "POST", token, body: data });
}

export function updateUser(
  token: string,
  id: string,
  data: UpdateUserBody,
): Promise<UserResponseBody> {
  return apiFetch<UserResponseBody>(`/users/${id}`, { method: "PATCH", token, body: data });
}
