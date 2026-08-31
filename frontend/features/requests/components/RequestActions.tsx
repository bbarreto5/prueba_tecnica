"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { RequestActionResult } from "../lib/actions";

type ActionKind = "take" | "return" | "cancel" | "resolve";

interface RequestActionsProps {
  requestId: string;
  canCancel?: boolean;
  canResolve?: boolean;
  canTake?: boolean;
  canReturn?: boolean;
  cancelAction?: (id: string) => Promise<RequestActionResult>;
  resolveAction?: (id: string) => Promise<RequestActionResult>;
  takeAction?: (id: string) => Promise<RequestActionResult>;
  returnAction?: (id: string) => Promise<RequestActionResult>;
}

const ACTION_COPY: Record<
  ActionKind,
  { title: string; description: string; confirmLabel: string; loadingLabel: string }
> = {
  take: {
    title: "¿Tomar esta solicitud?",
    description: "La solicitud será asignada a ti.",
    confirmLabel: "Tomar solicitud",
    loadingLabel: "Tomando...",
  },
  return: {
    title: "¿Devolver solicitud?",
    description: "La solicitud dejará de estar asignada a ti.",
    confirmLabel: "Devolver solicitud",
    loadingLabel: "Devolviendo...",
  },
  cancel: {
    title: "¿Cancelar solicitud?",
    description: "Esta acción cambiará el estado de la solicitud a “Cancelada”.",
    confirmLabel: "Cancelar solicitud",
    loadingLabel: "Cancelando...",
  },
  resolve: {
    title: "¿Resolver solicitud?",
    description: "La solicitud será marcada como “Resuelta”.",
    confirmLabel: "Resolver solicitud",
    loadingLabel: "Resolviendo...",
  },
};

export function RequestActions({
  requestId,
  canCancel = false,
  canResolve = false,
  canTake = false,
  canReturn = false,
  cancelAction,
  resolveAction,
  takeAction,
  returnAction,
}: RequestActionsProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<ActionKind | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canCancel && !canResolve && !canTake && !canReturn) {
    return <p className="text-sm text-[#6a7282]">No hay acciones disponibles para esta solicitud.</p>;
  }

  const actionsByKind: Partial<Record<ActionKind, (id: string) => Promise<RequestActionResult>>> = {
    take: takeAction,
    return: returnAction,
    cancel: cancelAction,
    resolve: resolveAction,
  };

  function handleConfirm() {
    if (!confirming) return;
    const action = actionsByKind[confirming];
    if (!action) return;
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

  const copy = confirming ? ACTION_COPY[confirming] : null;

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {canTake ? (
          <Button variant="primary" onClick={() => setConfirming("take")}>
            Tomar solicitud
          </Button>
        ) : null}
        {canReturn ? (
          <Button variant="ghost" onClick={() => setConfirming("return")}>
            Devolver
          </Button>
        ) : null}
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

      <Modal isOpen={confirming !== null} onClose={closeDialog} title={copy?.title ?? ""}>
        <div className="flex flex-col gap-5">
          <p className="text-sm text-[#9cb5c4]">{copy?.description}</p>

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
              {isPending ? copy?.loadingLabel : copy?.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
