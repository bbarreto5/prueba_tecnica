"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { RequestActionResult } from "../lib/actions";

type ActionKind = "take" | "cancel" | "resolve";

interface RequestActionsProps {
  requestId: string;
  canCancel?: boolean;
  canResolve?: boolean;
  canTake?: boolean;
  cancelAction?: (id: string) => Promise<RequestActionResult>;
  resolveAction?: (id: string) => Promise<RequestActionResult>;
  takeAction?: (id: string) => Promise<RequestActionResult>;
}

const ACTION_COPY: Record<
  ActionKind,
  {
    title: string;
    description: string;
    confirmLabel: string;
    loadingLabel: string;
    successMessage: string;
  }
> = {
  take: {
    title: "¿Tomar esta solicitud?",
    description: "La solicitud será asignada a ti.",
    confirmLabel: "Tomar solicitud",
    loadingLabel: "Tomando...",
    successMessage: "Solicitud tomada correctamente.",
  },
  cancel: {
    title: "¿Cancelar solicitud?",
    description: "Esta acción cambiará el estado de la solicitud a “Cancelada”.",
    confirmLabel: "Cancelar solicitud",
    loadingLabel: "Cancelando...",
    successMessage: "Solicitud cancelada correctamente.",
  },
  resolve: {
    title: "¿Resolver solicitud?",
    description: "La solicitud será marcada como “Resuelta”.",
    confirmLabel: "Resolver solicitud",
    loadingLabel: "Resolviendo...",
    successMessage: "Solicitud resuelta correctamente.",
  },
};

const ACTION_ICON_TONE: Record<ActionKind, string> = {
  take: "bg-[#09c6b8]/15 text-[#09c6b8]",
  resolve: "bg-[#09c6b8]/15 text-[#09c6b8]",
  cancel: "bg-[#fb2c36]/15 text-[#ff6568]",
};

function ActionIcon({ kind }: { kind: ActionKind }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ACTION_ICON_TONE[kind]}`}
    >
      {kind === "cancel" ? (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <path strokeLinecap="round" d="M6 6l8 8M14 6l-8 8" />
        </svg>
      ) : kind === "resolve" ? (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5l4 4 8-9" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 3.5v10M5.5 9l4.5 4.5L14.5 9" />
          <path strokeLinecap="round" d="M4 16.5h12" />
        </svg>
      )}
    </span>
  );
}

export function RequestActions({
  requestId,
  canCancel = false,
  canResolve = false,
  canTake = false,
  cancelAction,
  resolveAction,
  takeAction,
}: RequestActionsProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<ActionKind | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { message: toast, showToast } = useToast();

  if (!canCancel && !canResolve && !canTake) {
    return <p className="text-sm text-[#6a7282]">No hay acciones disponibles para esta solicitud.</p>;
  }

  const actionsByKind: Partial<Record<ActionKind, (id: string) => Promise<RequestActionResult>>> = {
    take: takeAction,
    cancel: cancelAction,
    resolve: resolveAction,
  };

  function handleConfirm() {
    if (!confirming) return;
    const action = actionsByKind[confirming];
    if (!action) return;
    const { successMessage } = ACTION_COPY[confirming];
    setError(null);

    startTransition(async () => {
      const result = await action(requestId);
      if (result.ok) {
        setConfirming(null);
        showToast(successMessage);
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
          <div className="flex items-center gap-3">
            {confirming ? <ActionIcon kind={confirming} /> : null}
            <p className="text-sm text-[#9cb5c4]">{copy?.description}</p>
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
              onClick={closeDialog}
              disabled={isPending}
              className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-[#6a7282] disabled:hover:bg-transparent"
            >
              Volver
            </button>
            <Button variant="primary" onClick={handleConfirm} disabled={isPending}>
              {isPending ? copy?.loadingLabel : copy?.confirmLabel}
            </Button>
          </div>
        </div>
      </Modal>

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
