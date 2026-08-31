"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { DashboardSection } from "@/components/DashboardSection";
import type { Company } from "@/features/companies/types";
import type { Role } from "@/types/role";
import type { UserActionResult } from "../lib/actions";
import type { User } from "../types";
import { UserFormModal } from "./UserFormModal";
import { UsersEmptyState } from "./UsersEmptyState";
import { UserTable } from "./UserTable";

interface UsersViewProps {
  initialUsers: User[];
  companies: Company[];
  companiesLoadError: boolean;
  assignableRoles: Role[];
  createAction: (formData: FormData) => Promise<UserActionResult>;
  updateAction: (id: string, formData: FormData) => Promise<UserActionResult>;
}

export function UsersView({
  initialUsers,
  companies,
  companiesLoadError,
  assignableRoles,
  createAction,
  updateAction,
}: UsersViewProps) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

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

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
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
          <input
            id="user-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full rounded-[2rem] border border-[#cccccc] bg-white px-4 py-2.5 text-sm text-[#101828] placeholder:text-[#9ca3af] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
          />
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
          <UserTable users={filteredUsers} companiesById={companiesById} onEdit={openEditModal} />
        </DashboardSection>
      )}

      <UserFormModal
        isOpen={isModalOpen}
        user={editingUser}
        assignableRoles={assignableRoles}
        companies={companies}
        companiesLoadError={companiesLoadError}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        createAction={createAction}
        updateAction={updateAction}
      />

      {toast ? (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[2rem] border border-[#e5e5e5] bg-white px-5 py-3 text-sm font-medium text-[#101828] shadow-[0_0_20px_#09c6b866]"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
