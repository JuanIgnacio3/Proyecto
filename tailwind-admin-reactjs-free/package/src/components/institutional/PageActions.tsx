import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

type PageActionsProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Bloque de acciones de una pagina (Nuevo, Exportar, Importar, etc.). Mantiene a
 * PageHeader agnostico de los botones: se pasa dentro de su prop `action`.
 */
const PageActions = ({ className, children }: PageActionsProps) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
);

export default PageActions;
