import type { ReactNode } from 'react';
import { Button } from 'src/components/ui/button';

type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  activateLabel?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  showActivate?: boolean;
  /** Override completo de las acciones. */
  children?: ReactNode;
};

/**
 * Cluster de acciones de fila alineado a la derecha (Editar / Desactivar / Activar).
 * Con `children` se reemplaza por acciones personalizadas.
 */
const RowActions = ({
  onEdit,
  onDelete,
  onActivate,
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  activateLabel = 'Activar',
  showEdit = true,
  showDelete = true,
  showActivate = false,
  children,
}: RowActionsProps) => (
  <div className="flex justify-end gap-2">
    {children ?? (
      <>
        {showEdit && onEdit && (
          <Button variant="ghostprimary" size="sm" onClick={onEdit}>
            {editLabel}
          </Button>
        )}
        {showDelete && onDelete && (
          <Button variant="ghosterror" size="sm" onClick={onDelete}>
            {deleteLabel}
          </Button>
        )}
        {showActivate && onActivate && (
          <Button variant="ghostprimary" size="sm" onClick={onActivate}>
            {activateLabel}
          </Button>
        )}
      </>
    )}
  </div>
);

export default RowActions;
