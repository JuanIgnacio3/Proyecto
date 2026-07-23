import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

type PageContainerProps = {
  className?: string;
  children: ReactNode;
};

/**
 * Contenedor principal de una pagina: unifica separacion vertical y ancho.
 * No reemplaza el grid de 12 columnas de las vistas de modulo; puede envolverlo.
 * Pensado para Dashboard y el futuro modulo publico.
 */
const PageContainer = ({ className, children }: PageContainerProps) => (
  <div className={cn('flex w-full flex-col gap-6', className)}>{children}</div>
);

export default PageContainer;
