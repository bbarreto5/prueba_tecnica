"use client";

import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { roleLabels } from "@/types/role";
import type { User } from "../types";

interface UserTableProps {
  users: User[];
  companiesById?: Map<string, string>;
  showCompanyColumn?: boolean;
  onEdit: (user: User) => void;
}

export function UserTable({
  users,
  companiesById,
  showCompanyColumn = true,
  onEdit,
}: UserTableProps) {
  const columnCount = showCompanyColumn ? 5 : 4;
  const { page, pageSize, pageCount, pageItems, totalItems, goToPage, changePageSize } =
    usePagination(users);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-xs tracking-wide text-[#6a7282] uppercase">
              <th className="py-3 pr-4 font-medium">Nombre</th>
              <th className="py-3 pr-4 font-medium">Correo</th>
              <th className="py-3 pr-4 font-medium">Rol</th>
              {showCompanyColumn ? <th className="py-3 pr-4 font-medium">Compañía</th> : null}
              <th className="py-3 pr-0 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {totalItems === 0 ? (
              <tr>
                <td colSpan={columnCount} className="py-6 text-center text-sm text-[#6a7282]">
                  No se encontraron usuarios para tu búsqueda.
                </td>
              </tr>
            ) : (
              pageItems.map((user) => (
                <tr key={user.id} className="border-b border-[#f3f4f6] last:border-0">
                  <td className="py-3 pr-4 font-medium text-[#101828]">{user.name}</td>
                  <td className="py-3 pr-4 text-[#6a7282]">{user.email}</td>
                  <td className="py-3 pr-4 text-[#6a7282]">{roleLabels[user.role]}</td>
                  {showCompanyColumn ? (
                    <td className="py-3 pr-4 text-[#6a7282]">
                      {user.companyId ? (companiesById?.get(user.companyId) ?? "—") : "—"}
                    </td>
                  ) : null}
                  <td className="py-3 pr-0">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="rounded-[2rem] border border-[#cccccc] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#101828] transition-colors hover:bg-[#f3f4f6] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:outline-none"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        pageCount={pageCount}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={goToPage}
        onPageSizeChange={changePageSize}
      />
    </div>
  );
}
