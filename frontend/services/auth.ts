import { apiFetch } from "@/lib/api-client";
import type { BackendRole } from "@/types/role";

/** Wire-format DTOs — field names match the backend contract exactly. */

interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginResponseBody {
  access_token: string;
  token_type: string;
}

export interface CurrentUserResponseBody {
  id: string;
  email: string;
  name: string;
  role: BackendRole;
}

export function login(credentials: LoginRequestBody): Promise<LoginResponseBody> {
  return apiFetch<LoginResponseBody>("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function fetchCurrentUser(token: string): Promise<CurrentUserResponseBody> {
  return apiFetch<CurrentUserResponseBody>("/auth/me", { token });
}
