export type Role = "admin" | "support" | "company" | "user";

export const roleLabels: Record<Role, string> = {
  admin: "Administrador",
  support: "Soporte",
  company: "Empresa",
  user: "Usuario",
};

/**
 * Role values as returned by the backend (`app/domain/enums/user.py::UserRole`).
 * This is the wire contract — do not change these values to match frontend
 * conventions. Use `mapBackendRole` to translate into the internal `Role`.
 */
export type BackendRole = "ADMIN" | "SUPPORT" | "COMPANY" | "USER";

const backendRoleMap: Record<BackendRole, Role> = {
  ADMIN: "admin",
  SUPPORT: "support",
  COMPANY: "company",
  USER: "user",
};

export function mapBackendRole(role: BackendRole): Role {
  return backendRoleMap[role];
}

/** Where to send a user immediately after login, based on their role. */
export const roleRedirectPath: Record<Role, string> = {
  admin: "/admin",
  support: "/support",
  company: "/company",
  user: "/requests",
};
