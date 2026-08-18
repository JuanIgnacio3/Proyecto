import { useEffect, useState } from 'react';

export type Pagination<T> = {
  page: number;
  setPage: (page: number) => void;
  pageCount: number;
  pageItems: T[];
  rangeStart: number;
  rangeEnd: number;
  total: number;
};

/**
 * Paginacion en cliente: divide una lista ya filtrada en paginas. Al cambiar el
 * total (p. ej. por una busqueda) mantiene la pagina dentro del rango valido.
 */
export function usePagination<T>(items: T[], pageSize = 10): Pagination<T> {
  const [page, setPage] = useState(1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    page: current,
    setPage,
    pageCount,
    pageItems,
    rangeStart: total === 0 ? 0 : start + 1,
    rangeEnd: Math.min(start + pageSize, total),
    total,
  };
}
