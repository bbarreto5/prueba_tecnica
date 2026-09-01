"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { MessageActionResult, RequestActionResult } from "../lib/actions";

const inputClassName =
  "rounded-[1.25rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 disabled:cursor-not-allowed disabled:border-[#e5e5e5] disabled:bg-[#f3f4f6] disabled:text-[#6a7282]";

interface ReturnToQueueActionProps {
  requestId: string;
  sendMessageAction: (requestId: string, formData: FormData) => Promise<MessageActionResult>;
  returnAction: (id: string) => Promise<RequestActionResult>;
}

/**
 * "Devolver a cola" requires a reason first: the reason is recorded via the
 * existing `POST /requests/{id}/messages` (there's no separate "return
 * reason" field on the backend), and only once that succeeds does it call
 * `POST /requests/{id}/return`. If the message fails, `return` is never
 * called. If `return` then fails, the reason is already recorded — the user
 * is told that explicitly rather than silently retrying the message.
 */
export function ReturnToQueueAction({
  requestId,
  sendMessageAction,
  returnAction,
}: ReturnToQueueActionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { message: toast, showToast } = useToast();

  function close() {
    if (isPending) return;
    setIsOpen(false);
    setReason("");
    setError(null);
  }

  function handleSubmit() {
    const trimmedReason = reason.trim();
    if (!trimmedReason) return;
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("content", trimmedReason);
      const messageResult = await sendMessageAction(requestId, formData);
      if (!messageResult.ok) {
        setError("No fue posible registrar el motivo. La solicitud no fue devuelta a la cola.");
        return;
      }

      const returnResult = await returnAction(requestId);
      if (!returnResult.ok) {
        setError(
          "El motivo fue registrado, pero no fue posible devolver la solicitud a la cola.",
        );
        return;
      }

      setIsOpen(false);
      setReason("");
      showToast("Solicitud devuelta a la cola correctamente.");
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setIsOpen(true)}>
        Devolver a cola
      </Button>

      <Modal isOpen={isOpen} onClose={close} title="Devolver solicitud">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="return-reason" className="text-sm text-[#9cb5c4]">
              ¿Por qué deseas devolver esta solicitud a la cola?
            </label>
            <textarea
              id="return-reason"
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isPending}
              placeholder="Explica por qué devuelves esta solicitud..."
              className={inputClassName}
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-[1.25rem] border border-[#ff6568]/30 bg-[#ff6568]/10 px-4 py-3 text-sm text-[#ff6568]"
            >
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={close}
              disabled={isPending}
              className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-[#6a7282] disabled:hover:bg-transparent"
            >
              Cancelar
            </button>
            <Button variant="primary" onClick={handleSubmit} disabled={isPending || !reason.trim()}>
              {isPending ? "Devolviendo..." : "Devolver"}
            </Button>
          </div>
        </div>
      </Modal>

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
