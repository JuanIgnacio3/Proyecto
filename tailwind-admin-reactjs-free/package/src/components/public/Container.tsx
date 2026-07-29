import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

/**
 * Contenedor de ancho del sitio publico: centra el contenido y aplica el ritmo
 * horizontal comun a todas las secciones (max-w-7xl + padding lateral).
 *
 * Emergio por repeticion durante la implementacion de Historia (se usa en el
 * cuerpo claro y en la franja del manifiesto). Es el unico primitive de layout
 * publico; las secciones lo componen. No sustituye al `PageContainer`
 * institucional del panel administrativo (lenguaje visual distinto).
 */
const Container = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('mx-auto w-full max-w-7xl px-6 lg:px-8', className)}>{children}</div>
);

export default Container;
