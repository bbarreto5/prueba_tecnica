"use server";

import { getSessionToken } from "@/features/auth/lib/session";
import { ApiError } from "@/lib/api-client";
import { createCompany, updateCompany } from "@/services/companies";
import { toCompany } from "./mappers";
import type { Company } from "../types";

export type CompanyActionResult = { ok: true; company: Company } | { ok: false; error: string };

export async function createCompanyAction(formData: FormData): Promise<CompanyActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "El nombre de la empresa es obligatorio." };
  }

  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const created = await createCompany(token, { name });
    return { ok: true, company: toCompany(created) };
  } catch (error) {
    return { ok: false, error: describeCompanyError(error) };
  }
}

export async function updateCompanyAction(
  id: string,
  formData: FormData,
): Promise<CompanyActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "El nombre de la empresa es obligatorio." };
  }
  const isActive = formData.get("isActive") === "on";

  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const updated = await updateCompany(token, id, { name, is_active: isActive });
    return { ok: true, company: toCompany(updated) };
  } catch (error) {
    return { ok: false, error: describeCompanyError(error) };
  }
}

function describeCompanyError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "No tienes permiso para realizar esta acción.";
    }
    if (error.status === 404) {
      return "Esta empresa ya no existe. Actualiza la página e intenta nuevamente.";
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
