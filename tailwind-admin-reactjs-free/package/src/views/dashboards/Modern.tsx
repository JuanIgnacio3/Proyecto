import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import CardBox from 'src/components/shared/CardBox';
import { ApiError } from 'src/lib/api';
import { getDashboardStats } from 'src/lib/stats';
import type { ConteoItem, DashboardStats } from 'src/types/stats';

const estadoColor: Record<string, string> = {
  Presente: 'bg-success',
  Ausente: 'bg-error',
  Tardia: 'bg-warning',
  Justificado: 'bg-info',
};

const BarList = ({
  items,
  colorFor,
  emptyText,
}: {
  items: ConteoItem[];
  colorFor?: (item: ConteoItem) => string;
  emptyText: string;
}) => {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }
  const max = Math.max(...items.map((i) => i.cantidad), 1);
  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={item.etiqueta}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{item.etiqueta}</span>
            <span className="text-muted-foreground">{item.cantidad}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${colorFor ? colorFor(item) : 'bg-primary'}`}
              style={{ width: `${(item.cantidad / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const ModernDash = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las metricas.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: 'Estudiantes activos',
          value: stats.estudiantes_activos,
          helper: 'Matricula vigente',
          icon: 'solar:user-rounded-linear',
          color: 'bg-lightprimary text-primary',
        },
        {
          label: 'Profesores',
          value: stats.profesores_activos,
          helper: 'Personal docente',
          icon: 'solar:square-academic-cap-linear',
          color: 'bg-lightsuccess text-success',
        },
        {
          label: 'Asistencia',
          value:
            stats.asistencia.porcentaje_presente === null
              ? '-'
              : `${stats.asistencia.porcentaje_presente}%`,
          helper: `${stats.asistencia.total_registros} registros`,
          icon: 'solar:checklist-minimalistic-linear',
          color: 'bg-lightwarning text-warning',
        },
        {
          label: 'Promedio de notas',
          value: stats.promedio_general_notas === null ? '-' : stats.promedio_general_notas,
          helper: `${stats.evaluaciones} evaluaciones`,
          icon: 'solar:clipboard-check-linear',
          color: 'bg-lightinfo text-info',
        },
      ]
    : [];

  const secundarias = stats
    ? [
        { label: 'Grupos', value: stats.grupos, icon: 'solar:layers-linear' },
        { label: 'Materias', value: stats.materias, icon: 'solar:notebook-bookmark-linear' },
        {
          label: 'Subgrupos',
          value: stats.subgrupos,
          icon: 'solar:users-group-two-rounded-linear',
        },
        { label: 'Encargados', value: stats.encargados_activos, icon: 'solar:user-hand-up-linear' },
      ]
    : [];

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <div className="overflow-hidden rounded-lg bg-primary text-white">
          <div className="grid min-h-[300px] grid-cols-12">
            <div className="col-span-12 flex flex-col justify-between p-7 lg:col-span-8 lg:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                  Sistema institucional
                </p>
                <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white lg:text-4xl">
                  Panel de gestion escolar con datos en vivo.
                </h1>
                <p className="mt-4 max-w-xl text-base text-white/75">
                  Metricas reales de la comunidad educativa, asistencia y evaluaciones,
                  conectadas directamente a la base de datos.
                </p>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
                <div>
                  <p className="text-3xl font-semibold text-secondary">
                    {stats ? stats.estudiantes_activos : '-'}
                  </p>
                  <p className="text-xs text-white/70">Estudiantes</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-secondary">
                    {stats ? stats.profesores_activos : '-'}
                  </p>
                  <p className="text-xs text-white/70">Docentes</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-secondary">
                    {stats && stats.asistencia.porcentaje_presente !== null
                      ? `${stats.asistencia.porcentaje_presente}%`
                      : '-'}
                  </p>
                  <p className="text-xs text-white/70">Asistencia</p>
                </div>
              </div>
            </div>
            <div className="relative col-span-12 hidden min-h-[220px] overflow-hidden bg-[#061b4c] lg:col-span-4 lg:block">
              <div className="absolute right-8 top-8 flex size-28 items-center justify-center rounded-md border border-secondary/50 bg-primary/80 text-secondary shadow-lg">
                <CostaRicaMark className="size-20" />
              </div>
              <div className="absolute bottom-8 left-8 right-8 rounded-md bg-white p-5 text-primary shadow-lg">
                <p className="text-sm font-semibold">Datos en tiempo real</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  FastAPI + PostgreSQL alimentando el panel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{error}</div>
        </div>
      )}

      {loading && (
        <div className="col-span-12">
          <CardBox className="p-10 text-center text-muted-foreground">Cargando metricas...</CardBox>
        </div>
      )}

      {stats && (
        <>
          {cards.map((item) => (
            <div key={item.label} className="col-span-12 sm:col-span-6 xl:col-span-3">
              <CardBox className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <h2 className="mt-2 text-3xl font-semibold">{item.value}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{item.helper}</p>
                  </div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-md ${item.color}`}
                  >
                    <Icon icon={item.icon} width={22} height={22} />
                  </div>
                </div>
              </CardBox>
            </div>
          ))}

          <div className="col-span-12 lg:col-span-6">
            <CardBox className="p-6">
              <h2 className="text-xl font-semibold">Estudiantes por grupo</h2>
              <p className="text-sm text-muted-foreground">Distribucion de la matricula.</p>
              <BarList
                items={stats.estudiantes_por_grupo}
                emptyText="Aun no hay estudiantes asignados a grupos."
              />
            </CardBox>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <CardBox className="p-6">
              <h2 className="text-xl font-semibold">Distribucion de asistencia</h2>
              <p className="text-sm text-muted-foreground">
                Sobre {stats.asistencia.total_registros} registros tomados.
              </p>
              <BarList
                items={stats.distribucion_asistencia}
                colorFor={(item) => estadoColor[item.etiqueta] ?? 'bg-primary'}
                emptyText="Aun no se ha tomado asistencia."
              />
            </CardBox>
          </div>

          <div className="col-span-12">
            <CardBox className="p-6">
              <h2 className="text-xl font-semibold">Resumen academico</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                {secundarias.map((item) => (
                  <div key={item.label} className="rounded-md border border-ld p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-md bg-lightprimary text-primary">
                        <Icon icon={item.icon} width={18} height={18} />
                      </span>
                      <div>
                        <p className="text-2xl font-semibold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBox>
          </div>
        </>
      )}
    </div>
  );
};

export default ModernDash;
