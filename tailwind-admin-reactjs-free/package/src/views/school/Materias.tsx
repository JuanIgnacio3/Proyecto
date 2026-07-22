import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Banner,
  CrudFormDialog,
  EmptyState,
  PageHeader,
} from 'src/components/institutional';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { useModal } from 'src/hooks/useModal';
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

  const { open, setOpen, editing, openCreate, openEdit } = useModal<Asignatura>();
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

  // Sincroniza el formulario cuando se abre el modal (crear o editar).
  useEffect(() => {
    if (!open) return;
    setNombre(editing ? editing.name_asignatura : '');
    setFormError(null);
  }, [open, editing]);

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
      <PageHeader
        icon="solar:notebook-bookmark-linear"
        title="Materias"
        description="Catalogo academico de asignaturas conectado al backend."
        action={
          isAdmin && (
            <Button onClick={openCreate} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Nueva materia
            </Button>
          )
        }
      />

      <div className="col-span-12">
        <CardBox className="p-0 overflow-hidden">
          <div className="border-b border-ld px-6 py-4">
            <h2 className="text-lg font-semibold">Listado</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Cargando...' : `${asignaturas.length} materia(s) registrada(s)`}
            </p>
          </div>

          {listError && (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          )}

          {!loading && !listError && asignaturas.length === 0 && (
            <EmptyState message="No hay materias registradas todavia." />
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

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar materia' : 'Nueva materia'}
        error={formError}
        saving={saving}
        onSubmit={handleSubmit}
        className="max-w-md"
      >
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
      </CrudFormDialog>
    </div>
  );
};

export default Materias;
