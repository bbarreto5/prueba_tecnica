import { apiFetch } from "@/lib/api-client";

/** Wire-format DTO — matches `app/application/messages/schemas.py::MessageResponse`. No author name/role — only a raw `author_id`. */
export interface MessageResponseBody {
  id: string;
  request_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export function listRequestMessages(
  token: string,
  requestId: string,
): Promise<MessageResponseBody[]> {
  return apiFetch<MessageResponseBody[]>(`/requests/${requestId}/messages`, { token });
}

export function createRequestMessage(
  token: string,
  requestId: string,
  content: string,
): Promise<MessageResponseBody> {
  return apiFetch<MessageResponseBody>(`/requests/${requestId}/messages`, {
    method: "POST",
    token,
    body: { content },
  });
}
