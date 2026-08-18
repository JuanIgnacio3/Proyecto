import { Icon } from '@iconify/react';
import { Button } from 'src/components/ui/button';
import { cn } from 'src/lib/utils';

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  rangeStart?: number;
  rangeEnd?: number;
  total?: number;
  className?: string;
};

/** Ventana compacta de numeros de pagina alrededor de la actual. */
function pageWindow(page: number, pageCount: number): number[] {
  const span = 1; // paginas a cada lado de la actual
  const start = Math.max(1, page - span);
  const end = Math.min(pageCount, page + span);
  const pages: number[] = [];
  for (let p = start; p <= end; p += 1) pages.push(p);
  return pages;
}

/**
 * Controles de paginacion al pie de una lista: rango mostrado + navegacion
 * (anterior / numeros / siguiente). No se muestra si hay una sola pagina.
 */
const Pagination = ({
  page,
  pageCount,
  onPageChange,
  rangeStart,
  rangeEnd,
  total,
  className,
}: PaginationProps) => {
  if (pageCount <= 1) return null;
  const pages = pageWindow(page, pageCount);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-ld px-6 py-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {total != null && rangeStart != null && rangeEnd != null && (
        <span className="text-sm text-muted-foreground">
          {rangeStart}-{rangeEnd} de {total}
        </span>
      )}
      <div className="flex items-center gap-1 sm:ml-auto">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Pagina anterior"
        >
          <Icon icon="solar:alt-arrow-left-linear" width={16} height={16} />
          Anterior
        </Button>
        {pages[0] > 1 && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onPageChange(1)}>
              1
            </Button>
            {pages[0] > 2 && <span className="px-1 text-muted-foreground">...</span>}
          </>
        )}
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Button>
        ))}
        {pages[pages.length - 1] < pageCount && (
          <>
            {pages[pages.length - 1] < pageCount - 1 && (
              <span className="px-1 text-muted-foreground">...</span>
            )}
            <Button variant="ghost" size="sm" onClick={() => onPageChange(pageCount)}>
              {pageCount}
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Pagina siguiente"
        >
          Siguiente
          <Icon icon="solar:alt-arrow-right-linear" width={16} height={16} />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
