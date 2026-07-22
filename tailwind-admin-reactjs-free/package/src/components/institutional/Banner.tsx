import type { ReactNode } from 'react';
import { cn } from 'src/lib/utils';

export type BannerTone = 'error' | 'success' | 'info' | 'warning';

const toneClass: Record<BannerTone, string> = {
  error: 'bg-lighterror text-error',
  success: 'bg-lightsuccess text-success',
  info: 'bg-lightinfo text-info',
  warning: 'bg-lightwarning text-warning',
};

type BannerProps = {
  tone?: BannerTone;
  className?: string;
  children: ReactNode;
};

/**
 * Mensaje contextual (error de listado, error de formulario, exito, etc.).
 * Unifica los bloques `bg-light* text-*` repetidos en las vistas.
 */
const Banner = ({ tone = 'error', className, children }: BannerProps) => (
  <div className={cn('rounded-md px-4 py-3 text-sm', toneClass[tone], className)}>{children}</div>
);

export default Banner;
