import { useCallback, useState } from 'react';

/**
 * Maneja el estado open/editing repetido en las vistas CRUD: un modal que se
 * abre en modo "crear" (editing = null) o "editar" (editing = registro).
 * La vista sigue siendo responsable de precargar/limpiar el formulario, para
 * no acoplar el hook a la forma de cada entidad.
 */
export function useModal<T>() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditing(item);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, setOpen, editing, openCreate, openEdit, close };
}
