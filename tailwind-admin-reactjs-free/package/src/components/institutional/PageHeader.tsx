import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import CardBox from 'src/components/shared/CardBox';

type PageHeaderProps = {
  icon: string;
  title: string;
  description?: string;
  /** Accion principal (normalmente un Button). Se alinea a la derecha. */
  action?: ReactNode;
};

/**
 * Cabecera institucional de un modulo: icono + titulo + descripcion y una
 * accion opcional. Reemplaza el bloque repetido en cada vista de modulo.
 * Se apoya en CardBox (primitive existente) y ocupa las 12 columnas del grid.
 */
const PageHeader = ({ icon, title, description, action }: PageHeaderProps) => (
  <div className="col-span-12">
    <CardBox className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
            <Icon icon={icon} width={24} height={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
    </CardBox>
  </div>
);

export default PageHeader;
