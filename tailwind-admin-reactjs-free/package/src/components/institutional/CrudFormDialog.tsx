import type { FormEvent, ReactNode } from 'react';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { cn } from 'src/lib/utils';
import Banner from './Banner';

type CrudFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Mensaje de error del formulario (se muestra como banner arriba). */
  error?: string | null;
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (e: FormEvent) => void;
  /** Clases para el DialogContent (p. ej. ancho: max-w-2xl). */
  className?: string;
  children: ReactNode;
};

/**
 * Dialogo de formulario CRUD institucional: envuelve el Dialog/DialogContent
 * (primitives existentes, con el fix de cierre ya incorporado) y aporta el
 * titulo, el banner de error, y el pie con Cancelar / Guardar. Solo hay que
 * pasar los campos del formulario como children.
 */
const CrudFormDialog = ({
  open,
  onOpenChange,
  title,
  error,
  saving,
  submitLabel = 'Guardar',
  onSubmit,
  className,
  children,
}: CrudFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn('max-w-lg', className)}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit} className="mt-2">
        {error && (
          <Banner tone="error" className="mb-4">
            {error}
          </Banner>
        )}

        {children}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);

export default CrudFormDialog;
