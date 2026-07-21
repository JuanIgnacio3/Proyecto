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
  createEvaluacion,
  deleteEvaluacion,
  getNotas,
  listEvaluaciones,
  saveNotas,
  updateEvaluacion,
} from 'src/lib/calificaciones';
import { listGrupos } from 'src/lib/grupos';
import type { Evaluacion } from 'src/types/calificaciones';
import type { Grupo } from 'src/types/grupo';

const emptyForm = { name_evaluacion: '', periodo: '1', porcentaje: '', fecha: '' };

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

type NotaRow = {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  valor: string;
};

const Calificaciones = () => {
  const { user } = useAuth();
  const canEdit = user?.rol.name_rol === 'Administrador' || user?.rol.name_rol === 'Profesor';

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [idGrupo, setIdGrupo] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal evaluacion
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evaluacion | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal notas
  const [notasOpen, setNotasOpen] = useState(false);
  const [notasEval, setNotasEval] = useState<Evaluacion | null>(null);
  const [notaRows, setNotaRows] = useState<NotaRow[]>([]);
  const [notasError, setNotasError] = useState<string | null>(null);
  const [notasSaving, setNotasSaving] = useState(false);
  const [notasLoading, setNotasLoading] = useState(false);

  useEffect(() => {
    listGrupos()
      .then(setGrupos)
      .catch(() => setError('No se pudieron cargar los grupos.'));
  }, []);

  const loadEvaluaciones = useCallback(async (grupo: string) => {
    if (!grupo) {
      setEvaluaciones([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEvaluaciones(await listEvaluaciones(Number(grupo)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las evaluaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvaluaciones(idGrupo);
  }, [idGrupo, loadEvaluaciones]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (ev: Evaluacion) => {
    setEditing(ev);
    setForm({
      name_evaluacion: ev.name_evaluacion,
      periodo: String(ev.periodo),
      porcentaje: String(ev.porcentaje),
      fecha: ev.fecha ?? '',
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        name_evaluacion: form.name_evaluacion,
        periodo: Number(form.periodo),
        porcentaje: Number(form.porcentaje),
        fecha: form.fecha || null,
        id_grupo: Number(idGrupo),
      };
      if (editing) {
        await updateEvaluacion(editing.id_evaluacion, payload);
      } else {
        await createEvaluacion(payload);
      }
      setOpen(false);
      await loadEvaluaciones(idGrupo);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la evaluacion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ev: Evaluacion) => {
    if (!confirm(`Eliminar la evaluacion "${ev.name_evaluacion}" y sus notas?`)) return;
    try {
      await deleteEvaluacion(ev.id_evaluacion);
      await loadEvaluaciones(idGrupo);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo eliminar.');
    }
  };

  const openNotas = async (ev: Evaluacion) => {
    setNotasEval(ev);
    setNotasError(null);
    setNotasOpen(true);
    setNotasLoading(true);
    try {
      const roster = await getNotas(ev.id_evaluacion);
      setNotaRows(
        roster.registros.map((r) => ({
          id_estudiante: r.id_estudiante,
          name_estudiante: r.name_estudiante,
          sec_name_estudiante: r.sec_name_estudiante,
          valor: r.valor === null ? '' : String(r.valor),
        })),
      );
    } catch (err) {
      setNotasError(err instanceof ApiError ? err.message : 'No se pudieron cargar las notas.');
      setNotaRows([]);
    } finally {
      setNotasLoading(false);
    }
  };

  const setNotaValor = (id: number, valor: string) =>
    setNotaRows((prev) => prev.map((r) => (r.id_estudiante === id ? { ...r, valor } : r)));

  const handleSaveNotas = async () => {
    if (!notasEval) return;
    setNotasSaving(true);
    setNotasError(null);
    try {
      await saveNotas(notasEval.id_evaluacion, {
        registros: notaRows.map((r) => ({
          id_estudiante: r.id_estudiante,
          valor: r.valor.trim() === '' ? null : Number(r.valor),
        })),
      });
      setNotasOpen(false);
    } catch (err) {
      setNotasError(err instanceof ApiError ? err.message : 'No se pudieron guardar las notas.');
    } finally {
      setNotasSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
              <Icon icon="solar:clipboard-check-linear" width={24} height={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Calificaciones</h1>
              <p className="mt-1 text-muted-foreground">
                Evaluaciones por grupo y periodo. Ingrese las notas por estudiante.
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-sm">
            <Label htmlFor="grupo">Grupo</Label>
            <select
              id="grupo"
              className={`${inputClass} mt-1`}
              value={idGrupo}
              onChange={(e) => setIdGrupo(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {grupos.map((g) => (
                <option key={g.id_grupo} value={g.id_grupo}>
                  {g.name_grupo} ({g.asignatura.name_asignatura})
                </option>
              ))}
            </select>
          </div>
        </CardBox>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}

      {idGrupo && (
        <div className="col-span-12">
          <CardBox className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-ld px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Evaluaciones</h2>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Cargando...' : `${evaluaciones.length} evaluacion(es)`}
                </p>
              </div>
              {canEdit && (
                <Button onClick={openCreate} size="sm">
                  <Icon icon="solar:add-circle-linear" width={18} height={18} />
                  Nueva evaluacion
                </Button>
              )}
            </div>

            {!loading && evaluaciones.length === 0 && (
              <div className="px-6 py-10 text-center text-muted-foreground">
                Este grupo no tiene evaluaciones todavia.
              </div>
            )}

            {evaluaciones.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-ld bg-muted/40">
                    <tr>
                      <th className="px-6 py-3 text-sm font-semibold">Evaluacion</th>
                      <th className="px-6 py-3 text-sm font-semibold">Periodo</th>
                      <th className="px-6 py-3 text-sm font-semibold">Porcentaje</th>
                      <th className="px-6 py-3 text-sm font-semibold">Fecha</th>
                      <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluaciones.map((ev) => (
                      <tr key={ev.id_evaluacion} className="border-b border-ld last:border-0">
                        <td className="px-6 py-4 font-medium">{ev.name_evaluacion}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.periodo}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.porcentaje}%</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.fecha ?? '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="lightprimary" size="sm" onClick={() => openNotas(ev)}>
                              Calificar
                            </Button>
                            {canEdit && (
                              <>
                                <Button
                                  variant="ghostprimary"
                                  size="sm"
                                  onClick={() => openEdit(ev)}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghosterror"
                                  size="sm"
                                  onClick={() => handleDelete(ev)}
                                >
                                  Eliminar
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBox>
        </div>
      )}

      {/* Modal crear/editar evaluacion */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar evaluacion' : 'Nueva evaluacion'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="evname">Nombre</Label>
                <Input
                  id="evname"
                  className="mt-1"
                  value={form.name_evaluacion}
                  onChange={(e) => setField('name_evaluacion', e.target.value)}
                  placeholder="Ej. Examen 1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="evperiodo">Periodo</Label>
                <select
                  id="evperiodo"
                  className={`${inputClass} mt-1`}
                  value={form.periodo}
                  onChange={(e) => setField('periodo', e.target.value)}
                >
                  <option value="1">I</option>
                  <option value="2">II</option>
                  <option value="3">III</option>
                </select>
              </div>
              <div>
                <Label htmlFor="evporcentaje">Porcentaje</Label>
                <Input
                  id="evporcentaje"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  className="mt-1"
                  value={form.porcentaje}
                  onChange={(e) => setField('porcentaje', e.target.value)}
                  placeholder="Ej. 25"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="evfecha">Fecha (opcional)</Label>
                <Input
                  id="evfecha"
                  type="date"
                  className="mt-1"
                  value={form.fecha}
                  onChange={(e) => setField('fecha', e.target.value)}
                />
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

      {/* Modal notas */}
      <Dialog open={notasOpen} onOpenChange={setNotasOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Notas: {notasEval?.name_evaluacion}</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {notasError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {notasError}
              </div>
            )}

            {notasLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : notaRows.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Este grupo no tiene estudiantes.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-md border border-ld">
                <table className="w-full text-left">
                  <thead className="border-b border-ld bg-muted/40">
                    <tr>
                      <th className="px-4 py-2 text-sm font-semibold">Estudiante</th>
                      <th className="px-4 py-2 text-sm font-semibold w-32">Nota (0-100)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notaRows.map((row) => (
                      <tr key={row.id_estudiante} className="border-b border-ld last:border-0">
                        <td className="px-4 py-2">
                          {row.name_estudiante} {row.sec_name_estudiante}
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.01"
                            disabled={!canEdit}
                            value={row.valor}
                            onChange={(e) => setNotaValor(row.id_estudiante, e.target.value)}
                            placeholder="-"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setNotasOpen(false)}>
                Cerrar
              </Button>
              {canEdit && notaRows.length > 0 && (
                <Button onClick={handleSaveNotas} disabled={notasSaving}>
                  {notasSaving ? 'Guardando...' : 'Guardar notas'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calificaciones;
