import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
  headerClassName?: string;
};

type CrudTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
};

/**
 * Tabla de datos estandar por configuracion de columnas. Maneja estados de carga
 * y vacio. Semantica accesible: <thead> con <th scope="col">. Distinta del
 * DataTable legado de la plantilla (no usa TanStack).
 */
function CrudTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  emptyMessage = 'No hay registros.',
}: CrudTableProps<T>) {
  if (loading) return <LoadingState />;
  if (rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="border-b border-ld bg-muted/40">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-6 py-3 text-sm font-semibold',
                  col.align === 'right' && 'text-right',
                  col.headerClassName,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-b border-ld last:border-0">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-6 py-4',
                    col.align === 'right' && 'text-right',
                    col.className,
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CrudTable;
