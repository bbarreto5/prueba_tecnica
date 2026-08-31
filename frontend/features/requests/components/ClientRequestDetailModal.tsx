"use client";

import { useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/Modal";
import { buildRequestInfoRows } from "../lib/infoRows";
import type { MessagesActionResult } from "../lib/actions";
import type { Message, RequestDetail } from "../types";
import { MessageBubbleList } from "./MessageBubbleList";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface ClientRequestDetailModalProps {
  /** The row selected from the client's history — already the full `RequestDetail` fetched by the page, so opening this never re-fetches the request itself. */
  request: RequestDetail | null;
  currentUserId: string;
  getMessagesAction: (requestId: string) => Promise<MessagesActionResult>;
  onClose: () => void;
}

/**
 * 100% read-only — no take/return/resolve/reply here, just the same info
 * rows shown on the main detail page plus its conversation. The request
 * itself never triggers a new fetch (see prop doc above); only the messages
 * are fetched, and only for the one request the user opens — never for the
 * whole history list.
 */
export function ClientRequestDetailModal({
  request,
  currentUserId,
  getMessagesAction,
  onClose,
}: ClientRequestDetailModalProps) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Reset to a fresh loading state as soon as a different request is opened
  // — adjusted during render (React's documented pattern for this), not in
  // an effect, so the effect below only ever does the actual fetch.
  if (request && request.id !== loadedForId) {
    setLoadedForId(request.id);
    setMessages(null);
    setLoadError(false);
  }

  useEffect(() => {
    if (!request) return;
    let cancelled = false;

    startTransition(async () => {
      const result = await getMessagesAction(request.id);
      if (cancelled) return;
      if (result.ok) {
        setMessages(result.messages);
      } else {
        setLoadError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [request, getMessagesAction]);

  const infoRows = request
    ? buildRequestInfoRows(request, currentUserId, request.companyName, request.requesterName)
    : [];

  return (
    <Modal isOpen={request !== null} onClose={onClose} title="Detalle de solicitud">
      {request ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />
          </div>

          <div>
            <p className="text-base font-bold text-white">{request.title}</p>
            <p className="mt-1 text-xs text-[#9cb5c4]">{request.id}</p>
          </div>

          <dl className="flex flex-col gap-3">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
                <dt className="text-[#9cb5c4]">{row.label}</dt>
                <dd className="font-medium text-white">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="text-xs font-medium text-[#9cb5c4]">Descripción</p>
            <p className="mt-2 text-sm leading-relaxed text-white">{request.description}</p>
          </div>

          <div className="border-t border-white/10 pt-5">
            <p className="mb-3 text-xs font-medium text-[#9cb5c4]">Conversación</p>
            {loadError ? (
              <p className="text-sm text-[#9cb5c4]">
                No pudimos cargar los mensajes de esta solicitud.
              </p>
            ) : messages === null ? (
              <p className="text-sm text-[#9cb5c4]">Cargando mensajes...</p>
            ) : (
              <MessageBubbleList
                messages={messages}
                currentUserId={currentUserId}
                requesterId={request.createdBy}
                assigneeId={request.assignedTo}
              />
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
