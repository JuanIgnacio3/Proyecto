import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';
import {
  createAsignatura,
  deleteAsignatura,
  listAsignaturas,
  updateAsignatura,
} from 'src/lib/asignaturas';
import type { Asignatura } from 'src/types/asignatura';

const Materias = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Asignatura | null>(null);
  const [nombre, setNombre] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAsignaturas = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setAsignaturas(await listAsignaturas());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAsignaturas();
  }, [loadAsignaturas]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (asignatura: Asignatura) => {
    setEditing(asignatura);
    setNombre(asignatura.name_asignatura);
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateAsignatura(editing.id_asignatura, { name_asignatura: nombre });
      } else {
        await createAsignatura({ name_asignatura: nombre });
      }
      setOpen(false);
      await loadAsignaturas();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la materia.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asignatura: Asignatura) => {
    if (!confirm(`Eliminar la materia "${asignatura.name_asignatura}"?`)) return;
    try {
      await deleteAsignatura(asignatura.id_asignatura);
      await loadAsignaturas();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo eliminar.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <Icon icon="solar:notebook-bookmark-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Materias</h1>
                <p className="mt-1 text-muted-foreground">
                  Catalogo academico de asignaturas conectado al backend.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Nueva materia
              </Button>
            )}
          </div>
        </CardBox>
      </div>

      <div className="col-span-12">
        <CardBox className="p-0 overflow-hidden">
          <div className="border-b border-ld px-6 py-4">
            <h2 className="text-lg font-semibold">Listado</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Cargando...' : `${asignaturas.length} materia(s) registrada(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && asignaturas.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay materias registradas todavia.
            </div>
          )}

          {asignaturas.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">#</th>
                    <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {asignaturas.map((asignatura) => (
                    <tr key={asignatura.id_asignatura} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 text-muted-foreground">
                        {asignatura.id_asignatura}
                      </td>
                      <td className="px-6 py-4 font-medium">{asignatura.name_asignatura}</td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(asignatura)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghosterror"
                              size="sm"
                              onClick={() => handleDelete(asignatura)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBox>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar materia' : 'Nueva materia'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div>
              <Label htmlFor="mnombre">Nombre de la materia</Label>
              <Input
                id="mnombre"
                className="mt-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Estudios Sociales"
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Materias;
