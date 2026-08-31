"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import type { Company } from "@/features/companies/types";
import { roleLabels, type Role } from "@/types/role";
import type { UserActionResult } from "../lib/actions";
import { getDefaultRole, ROLES_REQUIRING_COMPANY } from "../lib/permissions";
import type { User } from "../types";

interface UserFormModalProps {
  isOpen: boolean;
  user: User | null;
  assignableRoles: Role[];
  companies: Company[];
  companiesLoadError: boolean;
  onClose: () => void;
  onSuccess: (user: User, mode: "create" | "edit") => void;
  createAction: (formData: FormData) => Promise<UserActionResult>;
  updateAction: (id: string, formData: FormData) => Promise<UserActionResult>;
}

const inputClassName =
  "rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 disabled:opacity-60";

export function UserFormModal({
  isOpen,
  user,
  assignableRoles,
  companies,
  companiesLoadError,
  onClose,
  onSuccess,
  createAction,
  updateAction,
}: UserFormModalProps) {
  const mode = user ? "edit" : "create";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(
    user?.role ?? getDefaultRole(assignableRoles),
  );

  const requiresCompany = ROLES_REQUIRING_COMPANY.includes(selectedRole);
  const blockedByMissingCompanies = requiresCompany && companiesLoadError;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = user
        ? await updateAction(user.id, formData)
        : await createAction(formData);

      if (result.ok) {
        onSuccess(result.user, mode);
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
      title={mode === "create" ? "Nuevo usuario" : "Editar usuario"}
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
          <label htmlFor="user-name" className="text-xs font-medium text-[#9cb5c4]">
            Nombre
          </label>
          <input
            id="user-name"
            name="name"
            type="text"
            required
            defaultValue={user?.name ?? ""}
            disabled={isPending}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="user-email" className="text-xs font-medium text-[#9cb5c4]">
            Correo electrónico
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            required
            defaultValue={user?.email ?? ""}
            disabled={isPending}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="user-password" className="text-xs font-medium text-[#9cb5c4]">
            {mode === "create" ? "Contraseña" : "Nueva contraseña (opcional)"}
          </label>
          <input
            id="user-password"
            name="password"
            type="password"
            required={mode === "create"}
            minLength={8}
            disabled={isPending}
            placeholder={mode === "edit" ? "Dejar en blanco para no cambiarla" : undefined}
            autoComplete="new-password"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="user-role" className="text-xs font-medium text-[#9cb5c4]">
            Rol
          </label>
          <select
            id="user-role"
            name="role"
            required
            disabled={isPending}
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value as Role)}
            className={inputClassName}
          >
            {assignableRoles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </select>
        </div>

        {requiresCompany ? (
          <div className="flex flex-col gap-2">
            <label htmlFor="user-company" className="text-xs font-medium text-[#9cb5c4]">
              Compañía *
            </label>
            {companiesLoadError ? (
              <p className="rounded-[1.25rem] border border-[#ff6568]/30 bg-[#ff6568]/10 px-4 py-3 text-sm text-[#ff6568]">
                No pudimos cargar las compañías.{" "}
                <a href="/admin/users" className="underline">
                  Recargar la página
                </a>
                .
              </p>
            ) : (
              <select
                id="user-company"
                name="companyId"
                required
                disabled={isPending}
                defaultValue={user?.companyId ?? ""}
                className={inputClassName}
              >
                <option value="" disabled>
                  Selecciona una compañía
                </option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : null}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-[2rem] border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <Button type="submit" variant="primary" disabled={isPending || blockedByMissingCompanies}>
            {isPending
              ? mode === "create"
                ? "Creando..."
                : "Guardando..."
              : mode === "create"
                ? "Crear usuario"
                : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
