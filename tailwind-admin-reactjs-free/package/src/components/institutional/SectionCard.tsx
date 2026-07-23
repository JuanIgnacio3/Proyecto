import type { ReactNode } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { cn } from 'src/lib/utils';

type SectionCardProps = {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Card de seccion con barra de encabezado opcional (titulo + subtitulo + acciones)
 * y cuerpo libre. Estandariza el patron `CardBox p-0` + `border-b` de las listas.
 */
const SectionCard = ({
  title,
  subtitle,
  actions,
  bodyClassName,
  className,
  children,
}: SectionCardProps) => (
  <CardBox className={cn('p-0 overflow-hidden', className)}>
    {(title || subtitle || actions) && (
      <div className="flex items-center justify-between gap-4 border-b border-ld px-6 py-4">
        <div>
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    <div className={bodyClassName}>{children}</div>
  </CardBox>
);

export default SectionCard;
