const API_URL = process.env.API_URL ?? "http://localhost:8000";
const API_PREFIX = "/api/v1";

/**
 * Thrown for any non-2xx response or network failure.
 * `status` is 0 for network/connection failures (backend unreachable),
 * otherwise the HTTP status code returned by the backend.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  token?: string;
}

/**
 * Minimal fetch wrapper centralizing the backend base URL, JSON headers,
 * Authorization, and error normalization. Server-only: never called from
 * client components.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${API_PREFIX}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0);
  }

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return (await response.json()) as T;
}
