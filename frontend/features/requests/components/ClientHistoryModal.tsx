"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { MessagesActionResult } from "../lib/actions";
import type { RequestDetail } from "../types";
import { ClientHistorySection } from "./ClientHistorySection";

interface ClientHistoryModalProps {
  /** Other requests from the same company, newest-first, excluding the one currently being viewed. */
  history: RequestDetail[];
  historyLoadError: boolean;
  currentUserId: string;
  getMessagesAction: (requestId: string) => Promise<MessagesActionResult>;
}

export function ClientHistoryModal({
  history,
  historyLoadError,
  currentUserId,
  getMessagesAction,
}: ClientHistoryModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)} className="w-full">
        Ver historial del cliente
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Historial del cliente"
        size="lg"
        tone="light"
      >
        {historyLoadError ? (
          <p className="text-sm text-[#6a7282]">
            No pudimos cargar el historial del cliente. Intenta recargar la página.
          </p>
        ) : (
          <ClientHistorySection
            history={history}
            currentUserId={currentUserId}
            getMessagesAction={getMessagesAction}
          />
        )}
      </Modal>
    </>
  );
}
