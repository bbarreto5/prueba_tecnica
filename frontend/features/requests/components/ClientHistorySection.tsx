"use client";

import { useMemo, useState } from "react";
import type { MessagesActionResult } from "../lib/actions";
import type { RequestDetail } from "../types";
import { ClientRequestDetailModal } from "./ClientRequestDetailModal";
import { RequestTable } from "./RequestTable";

interface ClientHistorySectionProps {
  /** Other requests from the same company, newest-first, excluding the one currently being viewed. */
  history: RequestDetail[];
  currentUserId: string;
  getMessagesAction: (requestId: string) => Promise<MessagesActionResult>;
}

const inputClassName =
  "rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40";

export function ClientHistorySection({
  history,
  currentUserId,
  getMessagesAction,
}: ClientHistorySectionProps) {
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RequestDetail | null>(null);

  const filteredHistory = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return history;
    return history.filter(
      (request) =>
        request.title.toLowerCase().includes(normalized) ||
        request.id.toLowerCase().includes(normalized),
    );
  }, [history, search]);

  if (history.length === 0) {
    return <p className="text-sm text-[#6a7282]">Este cliente no tiene solicitudes anteriores.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-sm">
        <label htmlFor="history-search" className="sr-only">
          Buscar solicitud
        </label>
        <input
          id="history-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar solicitud..."
          className={inputClassName}
        />
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-sm text-[#6a7282]">
          No encontramos solicitudes que coincidan con tu búsqueda.
        </p>
      ) : (
        <RequestTable
          requests={filteredHistory}
          linkToDetail={false}
          renderActions={(request) => (
            <button
              type="button"
              onClick={() => setSelectedRequest(request)}
              className="rounded-sm text-sm font-medium text-[#ff8b1a] underline decoration-transparent underline-offset-2 transition-colors hover:decoration-current focus-visible:decoration-current focus-visible:outline-none"
            >
              Ver detalle
            </button>
          )}
        />
      )}

      <ClientRequestDetailModal
        request={selectedRequest}
        currentUserId={currentUserId}
        getMessagesAction={getMessagesAction}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
}
