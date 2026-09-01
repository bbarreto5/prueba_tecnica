"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { DashboardSection } from "@/components/DashboardSection";
import { Toast } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import type { Company } from "@/features/companies/types";
import type { Role } from "@/types/role";
import type { UserActionOptions, UserActionResult } from "../lib/actions";
import type { User } from "../types";
import { UserFormModal } from "./UserFormModal";
import { UsersEmptyState } from "./UsersEmptyState";
import { UserTable } from "./UserTable";

interface UsersViewProps {
  initialUsers: User[];
  companies?: Company[];
  companiesLoadError?: boolean;
  assignableRoles: Role[];
  /** false when the company is implicit from the session (e.g. `/company/users`). */
  showCompanyField?: boolean;
  showCompanyColumn?: boolean;
  createAction: (formData: FormData, options?: UserActionOptions) => Promise<UserActionResult>;
  updateAction: (
    id: string,
    formData: FormData,
    options?: UserActionOptions,
  ) => Promise<UserActionResult>;
}

export function UsersView({
  initialUsers,
  companies = [],
  companiesLoadError = false,
  assignableRoles,
  showCompanyField = true,
  showCompanyColumn = true,
  createAction,
  updateAction,
}: UsersViewProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { message: toast, showToast } = useToast();

  const companiesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const company of companies) map.set(company.id, company.name);
    return map;
  }, [companies]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized),
    );
  }, [users, query]);

  function openCreateModal() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function handleSuccess(user: User, mode: "create" | "edit") {
    setUsers((current) =>
      mode === "create"
        ? [user, ...current]
        : current.map((existing) => (existing.id === user.id ? user : existing)),
    );
    setIsModalOpen(false);
    showToast(
      mode === "create" ? "Usuario creado correctamente." : "Usuario actualizado correctamente.",
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-xs">
          <label htmlFor="user-search" className="sr-only">
            Buscar usuarios
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9ca3af]"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path strokeLinecap="round" d="M16 16l-3.5-3.5" />
            </svg>
            <input
              id="user-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full rounded-[2rem] border border-[#cccccc] bg-white py-2.5 pr-4 pl-10 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
            />
          </div>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="shrink-0">
          + Nuevo usuario
        </Button>
      </div>

      {users.length === 0 ? (
        <UsersEmptyState onCreate={openCreateModal} />
      ) : (
        <DashboardSection
          title="Todos los usuarios"
          description={`${filteredUsers.length} de ${users.length} usuarios`}
        >
          <UserTable
            users={filteredUsers}
            companiesById={companiesById}
            showCompanyColumn={showCompanyColumn}
            onEdit={openEditModal}
          />
        </DashboardSection>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        user={editingUser}
        assignableRoles={assignableRoles}
        showCompanyField={showCompanyField}
        companies={companies}
        companiesLoadError={companiesLoadError}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        createAction={createAction}
        updateAction={updateAction}
      />

      {toast ? <Toast message={toast} /> : null}
    </>
  );
}
