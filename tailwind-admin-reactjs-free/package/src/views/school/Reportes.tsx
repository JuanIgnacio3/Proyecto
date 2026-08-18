import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { FormSelect } from 'src/components/institutional';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';
import { getReporteEstudiante, listEstudiantesDisponibles } from 'src/lib/reportes';
import type {
  EstudianteDisponible,
  MateriaReporte,
  PeriodoReporte,
  ReporteEstudiante,
  RubroReporte,
} from 'src/types/reportes';

const estadoColor: Record<string, string> = {
  Presente: 'bg-lightsuccess text-success',
  Ausente: 'bg-lighterror text-error',
  Tardia: 'bg-lightwarning text-warning',
  Justificado: 'bg-lightinfo text-info',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const romano = (n: number) => ['I', 'II', 'III', 'IV'][n - 1] ?? String(n);
const num = (v: number | null) => (v === null ? '—' : v);

const notaColor = (v: number | null) =>
  v === null ? 'text-muted-foreground' : v >= 70 ? 'text-success' : 'text-error';

const RubroBloque = ({ rubro }: { rubro: RubroReporte }) => (
  <div className="rounded-md border border-ld">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ld bg-muted/40 px-4 py-2">
      <span className="text-sm font-semibold">
        {rubro.tipo} <span className="text-muted-foreground">· {rubro.peso}%</span>
      </span>
      <span className="text-xs text-muted-foreground">
        Aporte: <span className="font-medium text-ld">{num(rubro.contribucion)}</span>
      </span>
    </div>
    <table className="w-full text-left">
      <tbody>
        {rubro.items.map((item) => (
          <tr key={item.id_evaluacion} className="border-b border-ld last:border-0">
            <td className="px-4 py-2 text-sm">{item.name_evaluacion}</td>
            <td className="px-4 py-2 text-sm text-muted-foreground">{item.porcentaje}%</td>
            <td className="px-4 py-2 text-right text-sm">
              {item.valor === null ? (
                <span className="text-muted-foreground">Pendiente</span>
              ) : (
                <span className={`font-semibold ${notaColor(item.valor)}`}>{item.valor}</span>
              )}
            </td>
            <td className="px-4 py-2 text-right text-xs text-muted-foreground">
              {num(item.contribucion)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PeriodoBloque = ({ per }: { per: PeriodoReporte }) => (
  <div className="border-t border-ld px-6 py-4">
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <h3 className="text-sm font-semibold text-primary">Periodo {romano(per.periodo)}</h3>
      <div className="text-right">
        <span className={`text-2xl font-semibold ${notaColor(per.nota_periodo)}`}>
          {num(per.nota_periodo)}
        </span>
        <span className="ml-2 text-xs text-muted-foreground">nota (de {per.peso_total}% cubierto)</span>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {per.rubros.map((rubro) => (
        <RubroBloque key={rubro.tipo} rubro={rubro} />
      ))}

      <div className="rounded-md border border-ld">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ld bg-muted/40 px-4 py-2">
          <span className="text-sm font-semibold">
            Asistencia <span className="text-muted-foreground">· {per.asistencia.peso}%</span>
          </span>
          <span className="text-xs text-muted-foreground">
            Aporte: <span className="font-medium text-ld">{num(per.asistencia.contribucion)}</span>
          </span>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm">
            Presente:{' '}
            <span className="font-semibold">
              {per.asistencia.porcentaje_presente === null
                ? '—'
                : `${per.asistencia.porcentaje_presente}%`}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              ({per.asistencia.presentes}/{per.asistencia.total_registros})
            </span>
          </p>
          {per.asistencia.por_estado.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {per.asistencia.por_estado.map((c) => (
                <span
                  key={c.estado}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    estadoColor[c.estado] ?? 'bg-muted text-muted-foreground'
                  }`}
                >
                  {c.estado}: {c.cantidad}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const MateriaCard = ({ materia }: { materia: MateriaReporte }) => (
  <div className="col-span-12">
    <CardBox className="p-0 overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ld px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">{materia.materia}</h2>
          <p className="text-sm text-muted-foreground">
            Profesor: {materia.profesor} · Asistencia vale {materia.porcentaje_asistencia}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Nota final</p>
          <span className={`text-3xl font-bold ${notaColor(materia.nota_final)}`}>
            {num(materia.nota_final)}
          </span>
          <p className="text-xs text-muted-foreground">promedio de periodos</p>
        </div>
      </div>
      {materia.periodos.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-muted-foreground">
          Sin evaluaciones ni asistencia registradas todavia.
        </p>
      ) : (
        materia.periodos.map((per) => <PeriodoBloque key={per.periodo} per={per} />)
      )}
    </CardBox>
  </div>
);

const Reportes = () => {
  const { user } = useAuth();
  const esEstudiante = user?.rol.name_rol === 'Estudiante';

  const [estudiantes, setEstudiantes] = useState<EstudianteDisponible[]>([]);
  const [idEstudiante, setIdEstudiante] = useState('');
  const [reporte, setReporte] = useState<ReporteEstudiante | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listEstudiantesDisponibles()
      .then((lista) => {
        setEstudiantes(lista);
        // Un estudiante solo se ve a si mismo: cargar su reporte sin seleccionar.
        if (esEstudiante && lista.length > 0) {
          setIdEstudiante(String(lista[0].id_estudiante));
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.'),
      )
      .finally(() => setLoadingList(false));
  }, [esEstudiante]);

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
                Desglose por materia y periodo: examenes, tareas, cotidiano y asistencia, con la
                nota ponderada.
              </p>
            </div>
          </div>

          {!esEstudiante && (
            <div className="mt-5 max-w-md">
              <Label htmlFor="estudiante">Estudiante</Label>
              <FormSelect
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
              </FormSelect>
              {!loadingList && estudiantes.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay estudiantes disponibles para su usuario.
                </p>
              )}
            </div>
          )}
        </CardBox>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}

      {loadingReporte && (
        <div className="col-span-12">
          <CardBox className="p-10 text-center text-muted-foreground">Cargando reporte...</CardBox>
        </div>
      )}

      {reporte && !loadingReporte && (
        <>
          <div className="col-span-12">
            <CardBox className="p-6">
              <p className="text-sm text-muted-foreground">Estudiante</p>
              <h2 className="mt-1 text-xl font-semibold">
                {reporte.name_estudiante} {reporte.sec_name_estudiante}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Grupo: {reporte.grupo ?? 'Sin grupo'} · {reporte.materias.length} materia(s)
              </p>
            </CardBox>
          </div>

          {reporte.materias.length === 0 ? (
            <div className="col-span-12">
              <CardBox className="p-10 text-center text-muted-foreground">
                Este estudiante no tiene materias asignadas todavia.
              </CardBox>
            </div>
          ) : (
            reporte.materias.map((materia) => (
              <MateriaCard key={materia.id_clase} materia={materia} />
            ))
          )}
        </>
      )}
    </div>
  );
};

export default Reportes;
