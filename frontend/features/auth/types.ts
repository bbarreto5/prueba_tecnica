import type { Role } from "@/types/role";

/** App-facing shape of the authenticated user — already normalized (role is the internal `Role`, not the backend's raw string). */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
