import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import CardBox from 'src/components/shared/CardBox';
import {
  FormSelect,
  Pagination,
  SearchInput,
  StatusBadge,
  useConfirm,
} from 'src/components/institutional';
import { usePagination } from 'src/hooks/usePagination';
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
import { matchText } from 'src/lib/search';
import {
  activateEvaluacion,
  createEvaluacion,
  deleteEvaluacion,
  getNotas,
  listEvaluaciones,
  saveNotas,
  updateEvaluacion,
} from 'src/lib/calificaciones';
import { listMisClases } from 'src/lib/asignaciones';
import type { Asignacion } from 'src/types/asignacion';
import type { Evaluacion, TipoRubro } from 'src/types/calificaciones';

const RUBROS: TipoRubro[] = ['Examen', 'Tarea', 'Cotidiano'];

const emptyForm = { name_evaluacion: '', tipo: 'Examen', periodo: '1', porcentaje: '', fecha: '' };

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
  const { confirm, notify } = useConfirm();
  const canEdit = user?.rol.name_rol === 'Administrador' || user?.rol.name_rol === 'Profesor';

  const [clases, setClases] = useState<Asignacion[]>([]);
  const [idClase, setIdClase] = useState('');
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const evaluacionesFiltradas = evaluaciones.filter((ev) =>
    matchText(
      query,
      ev.name_evaluacion,
      ev.asignacion?.asignatura.name_asignatura,
      ev.asignacion?.profesor.name_profesor,
      ev.asignacion?.profesor.sec_name_profesor,
    ),
  );
  const paginacion = usePagination(evaluacionesFiltradas, 10);

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
    listMisClases()
      .then(setClases)
      .catch(() => setError('No se pudieron cargar las clases.'));
  }, []);

  const loadEvaluaciones = useCallback(async (clase: string) => {
    if (!clase) {
      setEvaluaciones([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setEvaluaciones(await listEvaluaciones(Number(clase)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las evaluaciones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvaluaciones(idClase);
  }, [idClase, loadEvaluaciones]);

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
      tipo: ev.tipo,
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
      const base = {
        name_evaluacion: form.name_evaluacion,
        tipo: form.tipo as TipoRubro,
        periodo: Number(form.periodo),
        porcentaje: Number(form.porcentaje),
        fecha: form.fecha || null,
      };
      if (editing) {
        // La edicion no cambia la asignacion; solo los datos de la evaluacion.
        await updateEvaluacion(editing.id_evaluacion, base);
      } else {
        await createEvaluacion({
          ...base,
          id_profesor_asignatura_grupo: Number(idClase),
        });
      }
      setOpen(false);
      await loadEvaluaciones(idClase);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la evaluacion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (ev: Evaluacion) => {
    if (
      !(await confirm({
        title: `Desactivar la evaluacion "${ev.name_evaluacion}"?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deleteEvaluacion(ev.id_evaluacion);
      await loadEvaluaciones(idClase);
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo desactivar.');
    }
  };

  const handleActivate = async (ev: Evaluacion) => {
    try {
      await activateEvaluacion(ev.id_evaluacion);
      await loadEvaluaciones(idClase);
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo activar.');
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
                Evaluaciones por clase (materia) y periodo. Ingrese las notas por estudiante.
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-md">
            <Label htmlFor="clase">Clase</Label>
            <FormSelect
              id="clase"
              className={`${inputClass} mt-1`}
              value={idClase}
              onChange={(e) => setIdClase(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {clases.map((c) => (
                <option
                  key={c.id_profesor_asignatura_grupo}
                  value={c.id_profesor_asignatura_grupo}
                >
                  {c.grupo.name_grupo} — {c.asignatura.name_asignatura} ({c.profesor.name_profesor}{' '}
                  {c.profesor.sec_name_profesor})
                </option>
              ))}
            </FormSelect>
          </div>
        </CardBox>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}

      {idClase && (
        <div className="col-span-12">
          <CardBox className="p-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-ld px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Evaluaciones</h2>
                <p className="text-sm text-muted-foreground">
                  {loading ? 'Cargando...' : `${evaluacionesFiltradas.length} evaluacion(es)`}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchInput
                  value={query}
                  onChange={setQuery}
                  placeholder="Buscar evaluacion, materia..."
                />
                {canEdit && (
                  <Button onClick={openCreate} size="sm">
                    <Icon icon="solar:add-circle-linear" width={18} height={18} />
                    Nueva evaluacion
                  </Button>
                )}
              </div>
            </div>

            {!loading && evaluacionesFiltradas.length === 0 && (
              <div className="px-6 py-10 text-center text-muted-foreground">
                No hay evaluaciones que coincidan con la busqueda.
              </div>
            )}

            {evaluacionesFiltradas.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-ld bg-muted/40">
                    <tr>
                      <th className="px-6 py-3 text-sm font-semibold">Evaluacion</th>
                      <th className="px-6 py-3 text-sm font-semibold">Rubro</th>
                      <th className="px-6 py-3 text-sm font-semibold">Periodo</th>
                      <th className="px-6 py-3 text-sm font-semibold">Porcentaje</th>
                      <th className="px-6 py-3 text-sm font-semibold">Fecha</th>
                      <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                      <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginacion.pageItems.map((ev) => (
                      <tr key={ev.id_evaluacion} className="border-b border-ld last:border-0">
                        <td className="px-6 py-4 font-medium">{ev.name_evaluacion}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.tipo}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.periodo}</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.porcentaje}%</td>
                        <td className="px-6 py-4 text-muted-foreground">{ev.fecha ?? '-'}</td>
                        <td className="px-6 py-4">
                          <StatusBadge active={ev.activo} />
                        </td>
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
                                {ev.activo ? (
                                  <Button
                                    variant="ghosterror"
                                    size="sm"
                                    onClick={() => handleDeactivate(ev)}
                                  >
                                    Desactivar
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghostprimary"
                                    size="sm"
                                    onClick={() => handleActivate(ev)}
                                  >
                                    Activar
                                  </Button>
                                )}
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
            {evaluacionesFiltradas.length > 0 && (
              <Pagination
                page={paginacion.page}
                pageCount={paginacion.pageCount}
                onPageChange={paginacion.setPage}
                rangeStart={paginacion.rangeStart}
                rangeEnd={paginacion.rangeEnd}
                total={paginacion.total}
              />
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
                <Label htmlFor="evtipo">Rubro</Label>
                <FormSelect
                  id="evtipo"
                  className={`${inputClass} mt-1`}
                  value={form.tipo}
                  onChange={(e) => setField('tipo', e.target.value)}
                >
                  {RUBROS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </FormSelect>
              </div>
              <div>
                <Label htmlFor="evperiodo">Periodo</Label>
                <FormSelect
                  id="evperiodo"
                  className={`${inputClass} mt-1`}
                  value={form.periodo}
                  onChange={(e) => setField('periodo', e.target.value)}
                >
                  <option value="1">I</option>
                  <option value="2">II</option>
                </FormSelect>
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
