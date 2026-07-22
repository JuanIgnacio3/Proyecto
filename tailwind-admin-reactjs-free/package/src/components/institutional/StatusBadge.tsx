import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

export type BadgeTone = 'success' | 'error' | 'warning' | 'info' | 'primary' | 'neutral';

const toneClass: Record<BadgeTone, string> = {
  success: 'bg-lightsuccess text-success',
  error: 'bg-lighterror text-error',
  warning: 'bg-lightwarning text-warning',
  info: 'bg-lightinfo text-info',
  primary: 'bg-lightprimary text-primary',
  neutral: 'bg-muted text-muted-foreground',
};

type StatusBadgeProps = {
  /** Atajo para el caso mas comun (Activo/Inactivo). Tiene prioridad sobre `tone`/`children`. */
  active?: boolean;
  tone?: BadgeTone;
  className?: string;
  children?: ReactNode;
};

/**
 * Pastilla de estado o categoria. Con `active` muestra Activo/Inactivo;
 * en otros casos usa `tone` + `children` (audiencia, tipo de evento, etc.).
 */
const StatusBadge = ({ active, tone = 'neutral', className, children }: StatusBadgeProps) => {
  const resolvedTone: BadgeTone = active === undefined ? tone : active ? 'success' : 'error';
  const label = active === undefined ? children : active ? 'Activo' : 'Inactivo';
  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-xs font-medium',
        toneClass[resolvedTone],
        className,
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
