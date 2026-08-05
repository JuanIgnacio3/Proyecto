import { Icon } from '@iconify/react';
import type { ReactNode } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';

type CrudScaffoldProps = {
  icon: string;
  title: string;
  subtitle: string;
  newLabel?: string;
  onNew?: () => void;
  canManage?: boolean;
  loading: boolean;
  error: string | null;
  /** Total de registros cargados (antes de filtrar). */
  total: number;
  /** Registros visibles tras aplicar filtros. */
  shown: number;
  emptyMessage: string;
  filteredEmptyMessage: string;
  /** Controles de filtro (composicion; el andamiaje no conoce el dominio). */
  filters?: ReactNode;
  /** Contenido: las tarjetas/filas col-span-* del dominio. */
  children?: ReactNode;
};

const Message = ({ children }: { children: ReactNode }) => (
  <div className="col-span-12">
    <CardBox className="p-10 text-center text-muted-foreground">{children}</CardBox>
  </div>
);

/**
 * Andamiaje comun de las vistas CRUD del panel (Comunicados, Eventos,
 * Especialidades): cabecera + boton "Nuevo" + barra de filtros + contador +
 * estados (cargando / error / vacio / filtro sin resultados) + contenedor grid.
 * No conoce el dominio: los filtros y las tarjetas se pasan por composicion.
 */
const CrudScaffold = ({
  icon,
  title,
  subtitle,
  newLabel = 'Nuevo',
  onNew,
  canManage = false,
  loading,
  error,
  total,
  shown,
  emptyMessage,
  filteredEmptyMessage,
  filters,
  children,
}: CrudScaffoldProps) => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-12">
      <CardBox className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
              <Icon icon={icon} width={24} height={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{title}</h1>
              <p className="mt-1 text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {canManage && onNew && (
            <Button onClick={onNew} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              {newLabel}
            </Button>
          )}
        </div>
      </CardBox>
    </div>

    {!loading && !error && total > 0 && (
      <div className="col-span-12">
        <CardBox className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            {filters}
            <span className="text-sm text-muted-foreground sm:ml-auto">
              {shown} de {total}
            </span>
          </div>
        </CardBox>
      </div>
    )}

    {error && (
      <div className="col-span-12">
        <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
      </div>
    )}

    {loading && <Message>Cargando...</Message>}
    {!loading && !error && total === 0 && <Message>{emptyMessage}</Message>}
    {!loading && !error && total > 0 && shown === 0 && <Message>{filteredEmptyMessage}</Message>}

    {!loading && !error && children}
  </div>
);

export default CrudScaffold;
