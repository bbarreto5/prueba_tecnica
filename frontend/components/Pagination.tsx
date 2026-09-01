"use client";

import { PAGE_SIZE_OPTIONS, type PageSize } from "@/hooks/usePagination";

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: PageSize;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-[#e5e5e5] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-[#6a7282]">
        <label htmlFor="page-size" className="font-medium whitespace-nowrap">
          Filas por página
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value) as PageSize)}
          className="rounded-full border border-[#cccccc] bg-white px-3 py-1.5 text-xs font-medium text-[#101828] outline-none transition-colors focus:border-[#ff8b1a] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="whitespace-nowrap">
          {start}–{end} de {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-full border border-[#cccccc] px-3 py-1.5 text-xs font-semibold text-[#101828] transition-colors hover:bg-[#f3f4f6] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-[#e5e5e5] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:hover:bg-[#f3f4f6]"
        >
          Anterior
        </button>
        <span className="px-1 text-xs font-medium whitespace-nowrap text-[#101828]">
          Página {page} de {pageCount}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="rounded-full border border-[#cccccc] px-3 py-1.5 text-xs font-semibold text-[#101828] transition-colors hover:bg-[#f3f4f6] focus-visible:ring-2 focus-visible:ring-[#ff8b1a]/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-[#e5e5e5] disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:hover:bg-[#f3f4f6]"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
