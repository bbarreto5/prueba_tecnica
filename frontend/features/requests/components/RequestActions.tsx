"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { RequestActionResult } from "../lib/actions";

interface RequestActionsProps {
  requestId: string;
  canCancel: boolean;
  canResolve: boolean;
  cancelAction: (id: string) => Promise<RequestActionResult>;
  resolveAction: (id: string) => Promise<RequestActionResult>;
}

type PendingConfirm = "cancel" | "resolve" | null;

export function RequestActions({
  requestId,
  canCancel,
  canResolve,
  cancelAction,
  resolveAction,
}: RequestActionsProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<PendingConfirm>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canCancel && !canResolve) {
    return <p className="text-sm text-[#6a7282]">No hay acciones disponibles para esta solicitud.</p>;
  }

  function handleConfirm() {
    const action = confirming === "cancel" ? cancelAction : resolveAction;
    setError(null);

    startTransition(async () => {
      const result = await action(requestId);
      if (result.ok) {
        setConfirming(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function closeDialog() {
    setError(null);
    setConfirming(null);
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {canCancel ? (
          <Button variant="ghost" onClick={() => setConfirming("cancel")}>
            Cancelar solicitud
          </Button>
        ) : null}
        {canResolve ? (
          <Button variant="primary" onClick={() => setConfirming("resolve")}>
            Resolver solicitud
          </Button>
        ) : null}
      </div>

      <Modal
        isOpen={confirming !== null}
        onClose={closeDialog}
        title={confirming === "cancel" ? "¿Cancelar solicitud?" : "¿Resolver solicitud?"}
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-[#9cb5c4]">
            {confirming === "cancel"
              ? "Esta acción cambiará el estado de la solicitud a “Cancelada”."
              : "La solicitud será marcada como “Resuelta”."}
          </p>

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
              onClick={closeDialog}
              disabled={isPending}
              className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Volver
            </button>
            <Button variant="primary" onClick={handleConfirm} disabled={isPending}>
              {isPending
                ? confirming === "cancel"
                  ? "Cancelando..."
                  : "Resolviendo..."
                : confirming === "cancel"
                  ? "Cancelar solicitud"
                  : "Resolver solicitud"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
