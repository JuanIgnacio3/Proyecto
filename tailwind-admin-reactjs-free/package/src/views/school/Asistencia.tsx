import { Icon } from '@iconify/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { FormSelect } from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';
import { listMisClases } from 'src/lib/asignaciones';
import { getRoster, saveRoster } from 'src/lib/asistencia';
import type { Asignacion } from 'src/types/asignacion';
import type { EstadoAsistencia } from 'src/types/asistencia';

const ESTADOS: EstadoAsistencia[] = ['Presente', 'Ausente', 'Tardia', 'Justificado'];

const estadoClasses: Record<EstadoAsistencia, string> = {
  Presente: 'bg-lightsuccess text-success',
  Ausente: 'bg-lighterror text-error',
  Tardia: 'bg-lightwarning text-warning',
  Justificado: 'bg-lightinfo text-info',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

type Row = {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  estado: EstadoAsistencia;
  observacion: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const Asistencia = () => {
  const { user } = useAuth();
  const canEdit = user?.rol.name_rol === 'Administrador' || user?.rol.name_rol === 'Profesor';

  const [clases, setClases] = useState<Asignacion[]>([]);
  const [idClase, setIdClase] = useState('');
  const [periodo, setPeriodo] = useState('1');
  const [fecha, setFecha] = useState(today());

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    listMisClases()
      .then(setClases)
      .catch(() => setError('No se pudieron cargar las clases.'));
  }, []);

  const loadRoster = useCallback(async () => {
    if (!idClase) return;
    setLoading(true);
    setError(null);
    setSavedMsg(null);
    try {
      const roster = await getRoster(Number(idClase), Number(periodo), fecha);
      setRows(
        roster.registros.map((r) => ({
          id_estudiante: r.id_estudiante,
          name_estudiante: r.name_estudiante,
          sec_name_estudiante: r.sec_name_estudiante,
          estado: r.estado ?? 'Presente',
          observacion: r.observacion ?? '',
        })),
      );
      setLoaded(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cargar la asistencia.');
      setRows([]);
      setLoaded(false);
    } finally {
      setLoading(false);
    }
  }, [idClase, periodo, fecha]);

  useEffect(() => {
    setLoaded(false);
    setRows([]);
    setSavedMsg(null);
  }, [idClase, periodo, fecha]);

  const setEstado = (id: number, estado: EstadoAsistencia) =>
    setRows((prev) => prev.map((r) => (r.id_estudiante === id ? { ...r, estado } : r)));

  const setObservacion = (id: number, observacion: string) =>
    setRows((prev) => prev.map((r) => (r.id_estudiante === id ? { ...r, observacion } : r)));

  const resumen = useMemo(() => {
    const acc: Record<EstadoAsistencia, number> = {
      Presente: 0,
      Ausente: 0,
      Tardia: 0,
      Justificado: 0,
    };
    rows.forEach((r) => {
      acc[r.estado] += 1;
    });
    return acc;
  }, [rows]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedMsg(null);
    try {
      await saveRoster({
        id_profesor_asignatura_grupo: Number(idClase),
        periodo: Number(periodo),
        fecha,
        registros: rows.map((r) => ({
          id_estudiante: r.id_estudiante,
          estado: r.estado,
          observacion: r.observacion || null,
        })),
      });
      setSavedMsg('Asistencia guardada correctamente.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la asistencia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
              <Icon icon="solar:checklist-minimalistic-linear" width={24} height={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Asistencia</h1>
              <p className="mt-1 text-muted-foreground">
                Tome lista por clase (materia) y fecha. Los estados se guardan por estudiante.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
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
            <div>
              <Label htmlFor="periodo">Periodo</Label>
              <FormSelect
                id="periodo"
                className={`${inputClass} mt-1`}
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="1">I</option>
                <option value="2">II</option>
              </FormSelect>
            </div>
            <div>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                className="mt-1"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="flex items-end sm:col-span-4">
              <Button onClick={loadRoster} disabled={!idClase || loading} className="w-full">
                {loading ? 'Cargando...' : 'Cargar lista'}
              </Button>
            </div>
          </div>
        </CardBox>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}

      {loaded && (
        <div className="col-span-12">
          <CardBox className="p-0 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-ld px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map((e) => (
                  <span
                    key={e}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${estadoClasses[e]}`}
                  >
                    {e}: {resumen[e]}
                  </span>
                ))}
              </div>
              {canEdit && rows.length > 0 && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar asistencia'}
                </Button>
              )}
            </div>

            {savedMsg && (
              <div className="m-6 rounded-md bg-lightsuccess px-4 py-3 text-sm text-success">
                {savedMsg}
              </div>
            )}

            {rows.length === 0 ? (
              <div className="px-6 py-10 text-center text-muted-foreground">
                Este grupo no tiene estudiantes asignados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-ld bg-muted/40">
                    <tr>
                      <th className="px-6 py-3 text-sm font-semibold">Estudiante</th>
                      <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                      <th className="px-6 py-3 text-sm font-semibold">Observacion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id_estudiante} className="border-b border-ld last:border-0">
                        <td className="px-6 py-4 font-medium">
                          {row.name_estudiante} {row.sec_name_estudiante}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {ESTADOS.map((e) => (
                              <button
                                key={e}
                                type="button"
                                disabled={!canEdit}
                                onClick={() => setEstado(row.id_estudiante, e)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                  row.estado === e
                                    ? estadoClasses[e]
                                    : 'bg-muted text-muted-foreground hover:bg-lightprimary hover:text-primary'
                                } ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            value={row.observacion}
                            disabled={!canEdit}
                            onChange={(e) => setObservacion(row.id_estudiante, e.target.value)}
                            placeholder="Opcional"
                            className="max-w-xs"
                          />
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
    </div>
  );
};

export default Asistencia;
