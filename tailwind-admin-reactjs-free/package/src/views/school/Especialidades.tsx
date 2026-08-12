import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import CardBox from 'src/components/shared/CardBox';
import {
  CrudScaffold,
  PublicationBadge,
  StatusBadge,
  useConfirm,
  VisibilityFilter,
  type Visibilidad,
} from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';
import {
  activateEspecialidad,
  createEspecialidad,
  deleteEspecialidad,
  listEspecialidades,
  updateEspecialidad,
} from 'src/lib/especialidades';
import { canManageEspecialidades } from 'src/lib/roles';
import type { Especialidad, EspecialidadInput } from 'src/types/especialidad';

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const emptyForm = {
  nombre: '',
  nivel: '',
  descripcion: '',
  salida_laboral: '',
  orden: '0',
  es_publico: false,
};

const Especialidades = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const canManage = canManageEspecialidades(user?.rol.name_rol);

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [fVisibilidad, setFVisibilidad] = useState<Visibilidad>('todos');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Especialidad | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setEspecialidades(await listEspecialidades());
    } catch (err) {
      setListError(
        err instanceof ApiError ? err.message : 'No se pudieron cargar las especialidades.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibles = useMemo(
    () =>
      especialidades.filter((e) => {
        if (fVisibilidad === 'publicos' && !e.es_publico) return false;
        if (fVisibilidad === 'privados' && e.es_publico) return false;
        return true;
      }),
    [especialidades, fVisibilidad],
  );

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (e: Especialidad) => {
    setEditing(e);
    setForm({
      nombre: e.nombre,
      nivel: e.nivel,
      descripcion: e.descripcion,
      salida_laboral: e.salida_laboral ?? '',
      orden: String(e.orden),
      es_publico: e.es_publico,
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload: EspecialidadInput = {
        nombre: form.nombre,
        nivel: form.nivel,
        descripcion: form.descripcion,
        salida_laboral: form.salida_laboral || null,
        imagen: null,
        es_publico: form.es_publico,
        orden: Number(form.orden) || 0,
      };
      if (editing) {
        await updateEspecialidad(editing.id_especialidad, payload);
      } else {
        await createEspecialidad(payload);
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la especialidad.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (e: Especialidad) => {
    if (
      !(await confirm({
        title: `Desactivar la especialidad "${e.nombre}"?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deleteEspecialidad(e.id_especialidad);
      await load();
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo desactivar.');
    }
  };

  const handleActivate = async (e: Especialidad) => {
    try {
      await activateEspecialidad(e.id_especialidad);
      await load();
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo activar.');
    }
  };

  return (
    <>
      <CrudScaffold
        icon="solar:medal-ribbons-star-linear"
        title="Especialidades"
        subtitle="Oferta técnica que se muestra en el sitio público."
        newLabel="Nueva especialidad"
        onNew={openCreate}
        canManage={canManage}
        loading={loading}
        error={listError}
        total={especialidades.length}
        shown={visibles.length}
        emptyMessage='No hay especialidades. Crea la primera con "Nueva especialidad".'
        filteredEmptyMessage="Ninguna especialidad coincide con el filtro seleccionado."
        filters={<VisibilityFilter value={fVisibilidad} onChange={setFVisibilidad} />}
      >
        {visibles.map((e) => (
          <div key={e.id_especialidad} className="col-span-12 lg:col-span-6">
            <CardBox className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <PublicationBadge isPublic={e.es_publico} />
                  <span className="rounded-full bg-lightprimary px-3 py-1 text-xs font-medium text-primary">
                    Orden {e.orden}
                  </span>
                  {canManage && !e.activo && <StatusBadge active={e.activo} />}
                </div>
                {canManage && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="ghostprimary" size="sm" onClick={() => openEdit(e)}>
                      Editar
                    </Button>
                    {e.activo ? (
                      <Button variant="ghosterror" size="sm" onClick={() => handleDeactivate(e)}>
                        Desactivar
                      </Button>
                    ) : (
                      <Button variant="ghostprimary" size="sm" onClick={() => handleActivate(e)}>
                        Activar
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <h2 className="mt-3 text-lg font-semibold">{e.nombre}</h2>
              <p className="mt-1 text-sm font-medium text-primary">{e.nivel}</p>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {e.descripcion}
              </p>
            </CardBox>
          </div>
        ))}
      </CrudScaffold>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar especialidad' : 'Nueva especialidad'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="enombre">Nombre</Label>
              <Input
                id="enombre"
                className="mt-1"
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Label htmlFor="enivel">Nivel</Label>
                <Input
                  id="enivel"
                  className="mt-1"
                  value={form.nivel}
                  onChange={(e) => setField('nivel', e.target.value)}
                  placeholder="Técnico profesional"
                  required
                />
              </div>
              <div>
                <Label htmlFor="eorden">Orden</Label>
                <Input
                  id="eorden"
                  type="number"
                  className="mt-1"
                  value={form.orden}
                  onChange={(e) => setField('orden', e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="edesc">Descripción</Label>
              <textarea
                id="edesc"
                className={`${inputClass} mt-1 h-28 py-2`}
                value={form.descripcion}
                onChange={(e) => setField('descripcion', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="esalida">Salida laboral (opcional)</Label>
              <textarea
                id="esalida"
                className={`${inputClass} mt-1 h-20 py-2`}
                value={form.salida_laboral}
                onChange={(e) => setField('salida_laboral', e.target.value)}
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="epublico"
                checked={form.es_publico}
                onCheckedChange={(v) => setForm((prev) => ({ ...prev, es_publico: v === true }))}
              />
              <Label htmlFor="epublico" className="cursor-pointer">
                Publicar en el sitio web
              </Label>
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
    </>
  );
};

export default Especialidades;
