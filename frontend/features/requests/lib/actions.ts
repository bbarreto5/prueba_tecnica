"use server";

import { redirect } from "next/navigation";
import { getSessionToken } from "@/features/auth/lib/session";
import { ApiError } from "@/lib/api-client";
import { cancelRequest, createRequest, resolveRequest } from "@/services/requests";
import { createRequestMessage } from "@/services/messages";
import { mapCategoryToBackend, mapPriorityToBackend, toMessage, toRequestDetail } from "./mappers";
import type { Message, RequestCategory, RequestDetail, RequestPriority } from "../types";

export type RequestActionResult =
  | { ok: true; request: RequestDetail }
  | { ok: false; error: string };

export type MessageActionResult = { ok: true; message: Message } | { ok: false; error: string };

const VALID_CATEGORIES: readonly string[] = ["incident", "question", "request"];
const VALID_PRIORITIES: readonly string[] = ["low", "medium", "high", "urgent"];

function parseCategory(value: FormDataEntryValue | null): RequestCategory | null {
  return typeof value === "string" && VALID_CATEGORIES.includes(value)
    ? (value as RequestCategory)
    : null;
}

function parsePriority(value: FormDataEntryValue | null): RequestPriority | null {
  return typeof value === "string" && VALID_PRIORITIES.includes(value)
    ? (value as RequestPriority)
    : null;
}

export async function createRequestAction(formData: FormData): Promise<RequestActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = parseCategory(formData.get("category"));
  const priority = parsePriority(formData.get("priority"));

  if (!title || !description || !category || !priority) {
    return { ok: false, error: "Completa todos los campos requeridos." };
  }

  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const created = await createRequest(token, {
      title,
      description,
      type: mapCategoryToBackend(category),
      priority: mapPriorityToBackend(priority),
    });
    return { ok: true, request: toRequestDetail(created) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session-expired");
    }
    return { ok: false, error: describeRequestError(error) };
  }
}

export async function cancelRequestAction(id: string): Promise<RequestActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const updated = await cancelRequest(token, id);
    return { ok: true, request: toRequestDetail(updated) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session-expired");
    }
    return { ok: false, error: describeRequestError(error) };
  }
}

export async function resolveRequestAction(id: string): Promise<RequestActionResult> {
  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const updated = await resolveRequest(token, id);
    return { ok: true, request: toRequestDetail(updated) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session-expired");
    }
    return { ok: false, error: describeRequestError(error) };
  }
}

export async function sendMessageAction(
  requestId: string,
  formData: FormData,
): Promise<MessageActionResult> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return { ok: false, error: "Escribe un mensaje antes de enviarlo." };
  }

  const token = await getSessionToken();
  if (!token) {
    return { ok: false, error: "Tu sesión no es válida. Vuelve a iniciar sesión." };
  }

  try {
    const created = await createRequestMessage(token, requestId, content);
    return { ok: true, message: toMessage(created) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/session-expired");
    }
    return { ok: false, error: describeMessageError(error) };
  }
}

function describeRequestError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "No tienes permisos para realizar esta acción.";
    }
    if (error.status === 404) {
      return "Esta solicitud ya no existe. Actualiza la página.";
    }
    if (error.status === 409) {
      return "Esta solicitud ya no admite esta acción en su estado actual.";
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

function describeMessageError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "No tienes permisos para enviar mensajes en esta solicitud.";
    }
    if (error.status === 404) {
      return "Esta solicitud ya no existe. Actualiza la página.";
    }
    if (error.status === 409) {
      return "No se pueden enviar mensajes en una solicitud resuelta o cancelada.";
    }
    if (error.status === 400 || error.status === 422) {
      return "El mensaje no es válido. Escribe un contenido antes de enviarlo.";
    }
    if (error.status === 0) {
      return "No pudimos conectarnos con el servidor. Intenta nuevamente.";
    }
  }
  return "Ocurrió un error inesperado. Intenta nuevamente.";
}
