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
import { listAsignaturas } from 'src/lib/asignaturas';
import { createGrupo, deleteGrupo, listGrupos, updateGrupo } from 'src/lib/grupos';
import type { Asignatura } from 'src/types/asignatura';
import type { Grupo } from 'src/types/grupo';

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Grupos = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Grupo | null>(null);
  const [nombre, setNombre] = useState('');
  const [idAsignatura, setIdAsignatura] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadGrupos = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setGrupos(await listGrupos());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  useEffect(() => {
    if (!open) return;
    listAsignaturas()
      .then(setAsignaturas)
      .catch(() => {
        /* el select quedara vacio; el backend valida igual */
      });
  }, [open]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setIdAsignatura('');
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (grupo: Grupo) => {
    setEditing(grupo);
    setNombre(grupo.name_grupo);
    setIdAsignatura(String(grupo.id_asignatura));
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = { name_grupo: nombre, id_asignatura: Number(idAsignatura) };
      if (editing) {
        await updateGrupo(editing.id_grupo, payload);
      } else {
        await createGrupo(payload);
      }
      setOpen(false);
      await loadGrupos();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el grupo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (grupo: Grupo) => {
    if (!confirm(`Eliminar el grupo "${grupo.name_grupo}"?`)) return;
    try {
      await deleteGrupo(grupo.id_grupo);
      await loadGrupos();
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
                <Icon icon="solar:layers-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Grupos y secciones</h1>
                <p className="mt-1 text-muted-foreground">
                  Organizacion de grupos por materia, conectada al backend.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Crear grupo
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
              {loading ? 'Cargando...' : `${grupos.length} grupo(s) registrado(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && grupos.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay grupos registrados todavia.
            </div>
          )}

          {grupos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">#</th>
                    <th className="px-6 py-3 text-sm font-semibold">Grupo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Materia</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {grupos.map((grupo) => (
                    <tr key={grupo.id_grupo} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 text-muted-foreground">{grupo.id_grupo}</td>
                      <td className="px-6 py-4 font-medium">{grupo.name_grupo}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {grupo.asignatura.name_asignatura}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(grupo)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghosterror"
                              size="sm"
                              onClick={() => handleDelete(grupo)}
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
            <DialogTitle>{editing ? 'Editar grupo' : 'Crear grupo'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="gnombre">Nombre del grupo</Label>
              <Input
                id="gnombre"
                className="mt-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. 7-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="gasignatura">Materia</Label>
              <select
                id="gasignatura"
                className={`${inputClass} mt-1`}
                value={idAsignatura}
                onChange={(e) => setIdAsignatura(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {asignaturas.map((a) => (
                  <option key={a.id_asignatura} value={a.id_asignatura}>
                    {a.name_asignatura}
                  </option>
                ))}
              </select>
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

export default Grupos;
