import { type ReactNode } from 'react';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** Si es undefined, no se muestra el boton Cancelar (modo aviso). */
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Dialogo de confirmacion institucional (sobre Radix Dialog + Button).
 * Presentacional y controlado. Normalmente se usa via `useConfirm`, no directamente.
 */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(next) => {
      if (!next) onCancel();
    }}
  >
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

      <div className="mt-6 flex justify-end gap-3">
        {cancelLabel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
        )}
        <Button
          type="button"
          variant={destructive ? 'error' : 'default'}
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;
