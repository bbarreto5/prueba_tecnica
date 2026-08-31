"use client";

import { Pagination } from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import type { CompanyOverview } from "../types";
import { CompanyStatusBadge } from "./CompanyStatusBadge";

export function CompanyOverviewList({ companies }: { companies: CompanyOverview[] }) {
  const { page, pageSize, pageCount, pageItems, totalItems, goToPage, changePageSize } =
    usePagination(companies);

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-6 overflow-x-auto px-6 sm:-mx-8 sm:px-8">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5e5e5] text-xs tracking-wide text-[#6a7282] uppercase">
              <th className="py-3 pr-4 font-medium">Empresa</th>
              <th className="py-3 pr-4 font-medium">Usuarios</th>
              <th className="py-3 pr-4 font-medium">Solicitudes abiertas</th>
              <th className="py-3 pr-0 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((company) => (
              <tr key={company.id} className="border-b border-[#f3f4f6] last:border-0">
                <td className="py-3 pr-4 font-medium text-[#101828]">{company.name}</td>
                <td className="py-3 pr-4 text-[#6a7282]">{company.usersCount ?? "—"}</td>
                <td className="py-3 pr-4 text-[#6a7282]">{company.openRequestsCount ?? "—"}</td>
                <td className="py-3 pr-0">
                  <CompanyStatusBadge status={company.status} />
                </td>
              </tr>
            ))}
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
