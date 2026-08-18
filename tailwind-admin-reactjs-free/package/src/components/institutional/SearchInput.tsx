import { Icon } from '@iconify/react';
import { cn } from 'src/lib/utils';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * Barra de busqueda estandar de las listas del panel: input con icono de lupa
 * (y boton de limpiar nativo via type="search"). Controlado por el consumidor.
 */
const SearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  className,
}: SearchInputProps) => (
  <div className={cn('relative w-full sm:w-64', className)}>
    <Icon
      icon="solar:magnifer-linear"
      width={18}
      height={18}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
    />
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="h-10 w-full rounded-lg border border-ld bg-transparent pl-9 pr-3 text-sm text-ld focus-visible:border-primary focus-visible:outline-0"
    />
  </div>
);

export default SearchInput;
