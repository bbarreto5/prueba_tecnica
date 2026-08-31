"use client";

import { useMemo, useState } from "react";

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface PaginationState<T> {
  page: number;
  pageSize: PageSize;
  pageCount: number;
  pageItems: T[];
  totalItems: number;
  goToPage: (page: number) => void;
  changePageSize: (pageSize: PageSize) => void;
}

/** Client-side pagination over an already-loaded array — slices `items` into pages, clamping the current page when the list shrinks (e.g. a filter narrows the results). */
export function usePagination<T>(
  items: T[],
  initialPageSize: PageSize = PAGE_SIZE_OPTIONS[0],
): PaginationState<T> {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(initialPageSize);

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;

  const pageItems = useMemo(
    () => items.slice(start, start + pageSize),
    [items, start, pageSize],
  );

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), pageCount));
  }

  function changePageSize(next: PageSize) {
    setPageSize(next);
    setPage(1);
  }

  return {
    page: currentPage,
    pageSize,
    pageCount,
    pageItems,
    totalItems: items.length,
    goToPage,
    changePageSize,
  };
}
