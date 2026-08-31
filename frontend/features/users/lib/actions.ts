"use server";

import { redirect } from "next/navigation";
import { getSessionToken } from "@/features/auth/lib/session";
import { ApiError } from "@/lib/api-client";
import { createUser, updateUser } from "@/services/users";
import { mapRoleToBackend, type Role } from "@/types/role";
import { toUser } from "./mappers";
import { ROLES_REQUIRING_COMPANY } from "./permissions";
import type { User } from "../types";

export type UserActionResult = { ok: true; user: User } | { ok: false; error: string };

/**
 * `skipCompanySelection`: set by callers whose company is implicit from the
 * session (e.g. `/company/users`, where a COMPANY-role user manages only
 * their own company). In that case no company select is rendered, so we
 * neither require nor read a `companyId` field — `company_id` is sent as
 * `null` and the backend auto-assigns/preserves the caller's own company
 * (see `create_user.py`/`update_user.py`: for a COMPANY caller it always
 * resolves to `current_user.company_id` regardless of what's sent).
 */
export interface UserActionOptions {
  skipCompanySelection?: boolean;
}

const VALID_ROLES: readonly string[] = ["admin", "support", "company", "user"];

function parseRole(value: FormDataEntryValue | null): Role | null {
  return typeof value === "string" && VALID_ROLES.includes(value) ? (value as Role) : null;
}

export async function createUserAction(
  formData: FormData,
  options: UserActionOptions = {},
): Promise<UserActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));
  const companyId = options.skipCompanySelection
    ? null
    : String(formData.get("companyId") ?? "").trim() || null;

  if (!name || !email || !password || !role) {
    return { ok: false, error: "Completa todos los campos requeridos." };
  }
  if (!options.skipCompanySelection && ROLES_REQUIRING_COMPANY.includes(role) && !companyId) {
    return { ok: false, error: "Selecciona una compañía para este rol." };
  }

  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const created = await createUser(token, {
      name,
      email,
      password,
      role: mapRoleToBackend(role),
      company_id: options.skipCompanySelection
        ? null
        : ROLES_REQUIRING_COMPANY.includes(role)
          ? companyId
          : null,
    });
    return { ok: true, user: toUser(created) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session-expired");
    }
    return { ok: false, error: describeUserError(error) };
  }
}

export async function updateUserAction(
  id: string,
  formData: FormData,
  options: UserActionOptions = {},
): Promise<UserActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const role = parseRole(formData.get("role"));
  const companyId = options.skipCompanySelection
    ? null
    : String(formData.get("companyId") ?? "").trim() || null;

  if (!name || !email || !role) {
    return { ok: false, error: "Completa todos los campos requeridos." };
  }
  if (!options.skipCompanySelection && ROLES_REQUIRING_COMPANY.includes(role) && !companyId) {
    return { ok: false, error: "Selecciona una compañía para este rol." };
  }

  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const updated = await updateUser(token, id, {
      name,
      email,
      ...(password ? { password } : {}),
      role: mapRoleToBackend(role),
      company_id: options.skipCompanySelection
        ? null
        : ROLES_REQUIRING_COMPANY.includes(role)
          ? companyId
          : null,
    });
    return { ok: true, user: toUser(updated) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session-expired");
    }
    return { ok: false, error: describeUserError(error) };
  }
}

function describeUserError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "No tienes permisos para realizar esta acción.";
    }
    if (error.status === 404) {
      return "Este usuario ya no existe. Actualiza la página.";
    }
    if (error.status === 409) {
      return "Ya existe un usuario con este correo electrónico.";
    }
    if (error.status === 400 || error.status === 422) {
      return "Revisa los datos ingresados e intenta nuevamente.";
    }
    if (error.status === 0) {
      return "No pudimos conectarnos con el servidor. Intenta nuevamente.";
    }
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
