"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { CompanyActionResult } from "../lib/actions";
import type { Company } from "../types";

interface CompanyFormModalProps {
  isOpen: boolean;
  company: Company | null;
  onClose: () => void;
  onSuccess: (company: Company, mode: "create" | "edit") => void;
  createAction: (formData: FormData) => Promise<CompanyActionResult>;
  updateAction: (id: string, formData: FormData) => Promise<CompanyActionResult>;
}

export function CompanyFormModal({
  isOpen,
  company,
  onClose,
  onSuccess,
  createAction,
  updateAction,
}: CompanyFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const mode = company ? "edit" : "create";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = company
        ? await updateAction(company.id, formData)
        : await createAction(formData);

      if (result.ok) {
        onSuccess(result.company, mode);
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === "create" ? "Nueva empresa" : "Editar empresa"}
    >
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
          <label htmlFor="company-name" className="text-xs font-medium text-[#9cb5c4]">
            Nombre de la empresa
          </label>
          <input
            id="company-name"
            name="name"
            type="text"
            required
            defaultValue={company?.name ?? ""}
            disabled={isPending}
            placeholder="Acme Corp"
            className="rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 disabled:cursor-not-allowed disabled:border-[#e5e5e5] disabled:bg-[#f3f4f6] disabled:text-[#6a7282]"
          />
        </div>

        {mode === "edit" ? (
          <label className="flex items-center gap-2 text-sm text-[#9cb5c4]">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={company?.isActive}
              disabled={isPending}
              className="h-4 w-4 rounded border-[#cccccc] accent-[#ff8b1a]"
            />
            Empresa activa
          </label>
        ) : null}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-[#6a7282] disabled:hover:bg-transparent"
          >
            Cancelar
          </button>
          <Button type="submit" variant="primary" disabled={isPending}>
            {isPending
              ? mode === "create"
                ? "Creando..."
                : "Guardando..."
              : mode === "create"
                ? "Crear empresa"
                : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
