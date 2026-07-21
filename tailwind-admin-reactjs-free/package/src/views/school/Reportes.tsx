import { Icon } from '@iconify/react';
import { useEffect, useMemo, useState } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { Label } from 'src/components/ui/label';
import { ApiError } from 'src/lib/api';
import { getReporteEstudiante, listEstudiantesDisponibles } from 'src/lib/reportes';
import type {
  EstudianteDisponible,
  NotaReporte,
  ReporteEstudiante,
} from 'src/types/reportes';

const estadoColor: Record<string, string> = {
  Presente: 'bg-lightsuccess text-success',
  Ausente: 'bg-lighterror text-error',
  Tardia: 'bg-lightwarning text-warning',
  Justificado: 'bg-lightinfo text-info',
};

const PERIODOS = ['I', 'II', 'III'];

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Reportes = () => {
  const [estudiantes, setEstudiantes] = useState<EstudianteDisponible[]>([]);
  const [idEstudiante, setIdEstudiante] = useState('');
  const [reporte, setReporte] = useState<ReporteEstudiante | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEstudiantesDisponibles()
      .then(setEstudiantes)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.'),
      )
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!idEstudiante) {
      setReporte(null);
      return;
    }
    setLoadingReporte(true);
    setError(null);
    getReporteEstudiante(Number(idEstudiante))
      .then(setReporte)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar el reporte.');
        setReporte(null);
      })
      .finally(() => setLoadingReporte(false));
  }, [idEstudiante]);

  const notasPorPeriodo = useMemo(() => {
    const map = new Map<number, NotaReporte[]>();
    reporte?.notas.forEach((n) => {
      const list = map.get(n.periodo) ?? [];
      list.push(n);
      map.set(n.periodo, list);
    });
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [reporte]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
              <Icon icon="solar:chart-square-linear" width={24} height={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Reportes</h1>
              <p className="mt-1 text-muted-foreground">
                Resumen de asistencia y calificaciones por estudiante.
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-md">
            <Label htmlFor="estudiante">Estudiante</Label>
            <select
              id="estudiante"
              className={`${inputClass} mt-1`}
              value={idEstudiante}
              onChange={(e) => setIdEstudiante(e.target.value)}
              disabled={loadingList}
            >
              <option value="">
                {loadingList ? 'Cargando...' : 'Seleccione un estudiante...'}
              </option>
              {estudiantes.map((e) => (
                <option key={e.id_estudiante} value={e.id_estudiante}>
                  {e.name_estudiante} {e.sec_name_estudiante}
                  {e.grupo ? ` - ${e.grupo}` : ''}
                </option>
              ))}
            </select>
            {!loadingList && estudiantes.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                No hay estudiantes disponibles para su usuario.
              </p>
            )}
          </div>
        </CardBox>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}

      {loadingReporte && (
        <div className="col-span-12">
          <CardBox className="p-10 text-center text-muted-foreground">
            Cargando reporte...
          </CardBox>
        </div>
      )}

      {reporte && !loadingReporte && (
        <>
          <div className="col-span-12 lg:col-span-4">
            <CardBox className="p-6">
              <p className="text-sm text-muted-foreground">Estudiante</p>
              <h2 className="mt-1 text-xl font-semibold">
                {reporte.name_estudiante} {reporte.sec_name_estudiante}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Grupo: {reporte.grupo ?? 'Sin grupo'}
              </p>

              <div className="mt-6 border-t border-ld pt-4">
                <p className="text-sm text-muted-foreground">Asistencia registrada</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-semibold">
                    {reporte.asistencia.porcentaje_presente === null
                      ? '-'
                      : `${reporte.asistencia.porcentaje_presente}%`}
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">presente</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reporte.asistencia.total_registros} registro(s)
                </p>

                {reporte.asistencia.por_estado.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {reporte.asistencia.por_estado.map((c) => (
                      <span
                        key={c.estado}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          estadoColor[c.estado] ?? 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c.estado}: {c.cantidad}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </CardBox>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <CardBox className="p-6">
              <h2 className="text-xl font-semibold">Calificaciones</h2>
              <p className="text-sm text-muted-foreground">Notas por periodo y evaluacion.</p>

              {reporte.notas.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Este estudiante no tiene evaluaciones registradas.
                </p>
              ) : (
                <div className="mt-4 space-y-6">
                  {notasPorPeriodo.map(([periodo, notas]) => (
                    <div key={periodo}>
                      <h3 className="mb-2 text-sm font-semibold text-primary">
                        Periodo {PERIODOS[periodo - 1] ?? periodo}
                      </h3>
                      <div className="overflow-x-auto rounded-md border border-ld">
                        <table className="w-full text-left">
                          <thead className="border-b border-ld bg-muted/40">
                            <tr>
                              <th className="px-4 py-2 text-sm font-semibold">Evaluacion</th>
                              <th className="px-4 py-2 text-sm font-semibold">Peso</th>
                              <th className="px-4 py-2 text-sm font-semibold">Fecha</th>
                              <th className="px-4 py-2 text-sm font-semibold text-right">Nota</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notas.map((n) => (
                              <tr
                                key={n.id_evaluacion}
                                className="border-b border-ld last:border-0"
                              >
                                <td className="px-4 py-2 font-medium">{n.name_evaluacion}</td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {n.porcentaje}%
                                </td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {n.fecha ?? '-'}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {n.valor === null ? (
                                    <span className="text-muted-foreground">Pendiente</span>
                                  ) : (
                                    <span
                                      className={`font-semibold ${
                                        n.valor >= 70 ? 'text-success' : 'text-error'
                                      }`}
                                    >
                                      {n.valor}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;
