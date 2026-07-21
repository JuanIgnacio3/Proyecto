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
import { listEstudiantes } from 'src/lib/estudiantes';
import { listGrupos } from 'src/lib/grupos';
import { listProfesores } from 'src/lib/profesores';
import {
  createSubgrupo,
  deleteSubgrupo,
  listSubgrupos,
  updateSubgrupo,
} from 'src/lib/subgrupos';
import type { Estudiante } from 'src/types/estudiante';
import type { Grupo } from 'src/types/grupo';
import type { Profesor } from 'src/types/profesor';
import type { Subgrupo } from 'src/types/subgrupo';

const emptyForm = { name_subgrupo: '', tipo_subgrupo: '', id_grupo: '' };

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Subgrupos = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [subgrupos, setSubgrupos] = useState<Subgrupo[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Subgrupo | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [profesoresIds, setProfesoresIds] = useState<number[]>([]);
  const [estudiantesIds, setEstudiantesIds] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSubgrupos = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setSubgrupos(await listSubgrupos());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubgrupos();
  }, [loadSubgrupos]);

  useEffect(() => {
    if (!open) return;
    Promise.all([listGrupos(), listProfesores(), listEstudiantes()])
      .then(([g, p, e]) => {
        setGrupos(g);
        setProfesores(p);
        setEstudiantes(e);
      })
      .catch(() => {
        /* los selectores quedaran vacios; el backend valida igual */
      });
  }, [open]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggle = (setter: typeof setProfesoresIds, id: number) =>
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setProfesoresIds([]);
    setEstudiantesIds([]);
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (sg: Subgrupo) => {
    setEditing(sg);
    setForm({
      name_subgrupo: sg.name_subgrupo,
      tipo_subgrupo: sg.tipo_subgrupo,
      id_grupo: String(sg.id_grupo),
    });
    setProfesoresIds(sg.profesores.map((p) => p.id_profesor));
    setEstudiantesIds(sg.estudiantes.map((e) => e.id_estudiante));
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        name_subgrupo: form.name_subgrupo,
        tipo_subgrupo: form.tipo_subgrupo,
        id_grupo: Number(form.id_grupo),
        profesores_ids: profesoresIds,
        estudiantes_ids: estudiantesIds,
      };
      if (editing) {
        await updateSubgrupo(editing.id_subgrupo, payload);
      } else {
        await createSubgrupo(payload);
      }
      setOpen(false);
      await loadSubgrupos();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el subgrupo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sg: Subgrupo) => {
    if (!confirm(`Eliminar el subgrupo "${sg.name_subgrupo}"?`)) return;
    try {
      await deleteSubgrupo(sg.id_subgrupo);
      await loadSubgrupos();
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
                <Icon icon="solar:users-group-two-rounded-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Subgrupos</h1>
                <p className="mt-1 text-muted-foreground">
                  Divisiones de un grupo (laboratorios, talleres) con sus profesores y estudiantes.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Crear subgrupo
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
              {loading ? 'Cargando...' : `${subgrupos.length} subgrupo(s) registrado(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && subgrupos.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay subgrupos registrados todavia.
            </div>
          )}

          {subgrupos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-sm font-semibold">Tipo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Grupo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Profesores</th>
                    <th className="px-6 py-3 text-sm font-semibold">Estudiantes</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {subgrupos.map((sg) => (
                    <tr key={sg.id_subgrupo} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 font-medium">{sg.name_subgrupo}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sg.tipo_subgrupo}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sg.grupo.name_grupo}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {sg.profesores.length === 0
                          ? '-'
                          : sg.profesores
                              .map((p) => `${p.name_profesor} ${p.sec_name_profesor}`)
                              .join(', ')}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {sg.estudiantes.length}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(sg)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghosterror"
                              size="sm"
                              onClick={() => handleDelete(sg)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar subgrupo' : 'Crear subgrupo'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="sgname">Nombre</Label>
                <Input
                  id="sgname"
                  className="mt-1"
                  value={form.name_subgrupo}
                  onChange={(e) => setField('name_subgrupo', e.target.value)}
                  placeholder="Ej. Laboratorio A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sgtipo">Tipo</Label>
                <Input
                  id="sgtipo"
                  className="mt-1"
                  value={form.tipo_subgrupo}
                  onChange={(e) => setField('tipo_subgrupo', e.target.value)}
                  placeholder="Ej. Laboratorio"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sggrupo">Grupo</Label>
                <select
                  id="sggrupo"
                  className={`${inputClass} mt-1`}
                  value={form.id_grupo}
                  onChange={(e) => setField('id_grupo', e.target.value)}
                  required
                >
                  <option value="">Seleccione...</option>
                  {grupos.map((g) => (
                    <option key={g.id_grupo} value={g.id_grupo}>
                      {g.name_grupo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Profesores</Label>
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-ld p-3">
                  {profesores.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin profesores.</p>
                  ) : (
                    profesores.map((p) => (
                      <label
                        key={p.id_profesor}
                        className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={profesoresIds.includes(p.id_profesor)}
                          onChange={() => toggle(setProfesoresIds, p.id_profesor)}
                        />
                        <span>
                          {p.name_profesor} {p.sec_name_profesor}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div>
                <Label>Estudiantes</Label>
                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-ld p-3">
                  {estudiantes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin estudiantes.</p>
                  ) : (
                    estudiantes.map((e) => (
                      <label
                        key={e.id_estudiante}
                        className="flex items-center gap-2 text-sm cursor-pointer py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={estudiantesIds.includes(e.id_estudiante)}
                          onChange={() => toggle(setEstudiantesIds, e.id_estudiante)}
                        />
                        <span>
                          {e.name_estudiante} {e.sec_name_estudiante}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
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

export default Subgrupos;
