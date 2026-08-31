"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { requestCategoryLabels, requestPriorityLabels } from "../lib/labels";
import type { RequestActionResult } from "../lib/actions";
import type { RequestCategory, RequestDetail, RequestPriority } from "../types";

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (request: RequestDetail) => void;
  createAction: (formData: FormData) => Promise<RequestActionResult>;
}

const inputClassName =
  "rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 disabled:opacity-60";

const categories = Object.keys(requestCategoryLabels) as RequestCategory[];
const priorities = Object.keys(requestPriorityLabels) as RequestPriority[];

export function RequestFormModal({
  isOpen,
  onClose,
  onSuccess,
  createAction,
}: RequestFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await createAction(formData);
      if (result.ok) {
        onSuccess(result.request);
      } else {
        setError(result.error);
      }
    });
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva solicitud">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error ? (
          <div
            role="alert"
            className="rounded-[1.25rem] border border-[#ff6568]/30 bg-[#ff6568]/10 px-4 py-3 text-sm text-[#ff6568]"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="request-title" className="text-xs font-medium text-[#9cb5c4]">
            Título
          </label>
          <input
            id="request-title"
            name="title"
            type="text"
            required
            disabled={isPending}
            placeholder="No se puede acceder al portal de facturación"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="request-description" className="text-xs font-medium text-[#9cb5c4]">
            Descripción
          </label>
          <textarea
            id="request-description"
            name="description"
            rows={4}
            required
            disabled={isPending}
            placeholder="Cuéntanos qué está pasando..."
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="request-category" className="text-xs font-medium text-[#9cb5c4]">
            Categoría
          </label>
          <select
            id="request-category"
            name="category"
            required
            disabled={isPending}
            defaultValue="incident"
            className={inputClassName}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {requestCategoryLabels[category]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="request-priority" className="text-xs font-medium text-[#9cb5c4]">
            Prioridad
          </label>
          <select
            id="request-priority"
            name="priority"
            required
            disabled={isPending}
            defaultValue="medium"
            className={inputClassName}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {requestPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending ? "Creando..." : "Crear solicitud"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
