"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/Button";
import type { MessageActionResult } from "../lib/actions";
import type { Message } from "../types";

interface RequestMessagesProps {
  requestId: string;
  initialMessages: Message[];
  loadError: boolean;
  canSend: boolean;
  currentUserId: string;
  requesterId: string;
  assigneeId: string | null;
  sendAction: (requestId: string, formData: FormData) => Promise<MessageActionResult>;
  /** Shown instead of the composer when `canSend` is false. Defaults to the "closed request" copy used by the public /requests view. */
  disabledMessage?: string;
}

export function RequestMessages({
  requestId,
  initialMessages,
  loadError,
  canSend,
  currentUserId,
  requesterId,
  assigneeId,
  sendAction,
  disabledMessage = "Esta solicitud está cerrada y ya no admite nuevos mensajes.",
}: RequestMessagesProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function authorLabel(authorId: string): string {
    if (authorId === currentUserId) return "Tú";
    if (authorId === assigneeId) return "Soporte";
    if (authorId === requesterId) return "Solicitante";
    return "Equipo";
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setError(null);
    const formData = new FormData();
    formData.set("content", content);

    startTransition(async () => {
      const result = await sendAction(requestId, formData);
      if (result.ok) {
        setMessages((current) => [...current, result.message]);
        setContent("");
      } else {
        setError(result.error);
      }
    });
  }

  if (loadError) {
    return (
      <p className="text-sm text-[#6a7282]">
        No pudimos cargar los mensajes. Intenta recargar la página.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {messages.length === 0 ? (
        <p className="text-sm text-[#6a7282]">No hay mensajes todavía.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {messages.map((message) => {
            const isOwn = message.authorId === currentUserId;
            return (
              <li
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.25rem] border px-4 py-3 sm:max-w-[70%] ${
                    isOwn
                      ? "border-transparent bg-[#07131b] text-white"
                      : "border-[#e5e5e5] bg-white text-[#101828]"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${isOwn ? "text-[#9cb5c4]" : "text-[#6a7282]"}`}
                  >
                    {authorLabel(message.authorId)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`mt-1.5 text-xs ${isOwn ? "text-[#6a7282]" : "text-[#9ca3af]"}`}
                  >
                    {message.createdAt}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {canSend ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 border-t border-[#e5e5e5] pt-6"
        >
          {error ? (
            <div
              role="alert"
              className="rounded-[1.25rem] border border-[#fb2c36]/30 bg-[#fb2c36]/10 px-4 py-3 text-sm text-[#bf000f]"
            >
              {error}
            </div>
          ) : null}
          <label htmlFor="reply" className="text-xs font-medium text-[#6a7282]">
            Responder
          </label>
          <textarea
            id="reply"
            name="content"
            rows={3}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isPending}
            placeholder="Escribe una respuesta..."
            className="rounded-[1.25rem] border border-[#cccccc] bg-white px-4 py-3 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 disabled:opacity-60"
          />
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isPending || !content.trim()}>
              {isPending ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="border-t border-[#e5e5e5] pt-6 text-sm text-[#6a7282]">
          {disabledMessage}
        </p>
      )}
    </div>
  );
}
