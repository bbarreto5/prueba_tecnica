"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api-client";
import { fetchCurrentUser, login } from "@/services/auth";
import { mapBackendRole, roleRedirectPath } from "@/types/role";
import { setSessionCookie } from "./session";

export interface LoginFormState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y tu contraseña." };
  }

  let accessToken: string;
  try {
    const loginResponse = await login({ email, password });
    accessToken = loginResponse.access_token;
  } catch (error) {
    return { error: describeLoginError(error) };
  }

  try {
    const currentUser = await fetchCurrentUser(accessToken);
    await setSessionCookie(accessToken);
    redirect(roleRedirectPath[mapBackendRole(currentUser.role)]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: "No pudimos completar el inicio de sesión. Intenta nuevamente." };
  }
}

function describeLoginError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Correo o contraseña incorrectos.";
    if (error.status === 0) {
      return "No pudimos conectarnos con el servidor. Intenta nuevamente.";
    }
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}

/** `redirect()` works by throwing a special error Next.js catches upstream — re-throw it instead of treating it as a real failure. */
function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
