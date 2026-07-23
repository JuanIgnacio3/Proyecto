import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

type CheckboxListProps<T> = {
  items: T[];
  getId: (item: T) => number;
  getLabel: (item: T) => ReactNode;
  selected: number[];
  onToggle: (id: number) => void;
  emptyText?: string;
  columns?: 1 | 2;
  maxHeightClassName?: string;
};

/**
 * Lista de multiseleccion con scroll (marcar varios registros). Usa checkbox
 * nativo (teclado/foco por defecto) con etiqueta asociada por envoltura <label>.
 */
function CheckboxList<T>({
  items,
  getId,
  getLabel,
  selected,
  onToggle,
  emptyText = 'No hay elementos disponibles.',
  columns = 1,
  maxHeightClassName = 'max-h-40',
}: CheckboxListProps<T>) {
  return (
    <div className={cn('overflow-y-auto rounded-md border border-ld p-3', maxHeightClassName)}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className={cn('grid grid-cols-1 gap-2', columns === 2 && 'sm:grid-cols-2')}>
          {items.map((item) => {
            const id = getId(item);
            return (
              <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(id)}
                  onChange={() => onToggle(id)}
                />
                <span>{getLabel(item)}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CheckboxList;
