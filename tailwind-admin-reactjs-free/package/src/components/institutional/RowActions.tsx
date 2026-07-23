import type { ReactNode } from 'react';
import { Button } from 'src/components/ui/button';

type RowActionsProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  /** Override completo de las acciones. */
  children?: ReactNode;
};

/**
 * Cluster de acciones de fila alineado a la derecha (Editar / Eliminar).
 * Con `children` se reemplaza por acciones personalizadas.
 */
const RowActions = ({
  onEdit,
  onDelete,
  editLabel = 'Editar',
  deleteLabel = 'Eliminar',
  showEdit = true,
  showDelete = true,
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
      </>
    )}
  </div>
);

export default RowActions;
