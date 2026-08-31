import type { Role } from "@/types/role";

/**
 * Mirrors the backend's `CREATABLE_ROLES` table
 * (`app/application/users/authorization.py`) for UI purposes only — which
 * roles the current user is offered when creating/reassigning a user.
 * This is NOT the security boundary: the backend re-validates independently
 * and is the real authority.
 */
const CREATABLE_ROLES: Record<Role, Role[]> = {
  admin: ["admin", "support", "company", "user"],
  support: ["company", "user"],
  company: ["user"],
  user: [],
};

export function getAssignableRoles(currentUserRole: Role): Role[] {
  return CREATABLE_ROLES[currentUserRole];
}

/** Preference order for the role select's initial value — favors the least-privileged option available. */
const DEFAULT_ROLE_PRIORITY: Role[] = ["user", "company", "support", "admin"];

export function getDefaultRole(assignableRoles: Role[]): Role {
  return DEFAULT_ROLE_PRIORITY.find((role) => assignableRoles.includes(role)) ?? assignableRoles[0];
}

/** Roles that require a company to be selected (matches the backend's own rule). */
export const ROLES_REQUIRING_COMPANY: Role[] = ["company", "user"];
