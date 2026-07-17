import { Icon } from '@iconify/react';
import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import CardBox from 'src/components/shared/CardBox';

const stats = [
  {
    label: 'Estudiantes activos',
    value: '842',
    helper: 'Matricula 2026',
    icon: 'solar:user-rounded-linear',
    color: 'bg-lightprimary text-primary',
  },
  {
    label: 'Profesores',
    value: '58',
    helper: 'Personal docente',
    icon: 'solar:square-academic-cap-linear',
    color: 'bg-lightsuccess text-success',
  },
  {
    label: 'Asistencia hoy',
    value: '94%',
    helper: 'Promedio institucional',
    icon: 'solar:checklist-minimalistic-linear',
    color: 'bg-lightwarning text-warning',
  },
  {
    label: 'Comunicados',
    value: '12',
    helper: 'Publicados este mes',
    icon: 'solar:notification-unread-linear',
    color: 'bg-lightinfo text-info',
  },
];

const modules = [
  'Matricula y expedientes',
  'Horarios y grupos',
  'Asistencia diaria',
  'Calificaciones',
  'Comunicacion con encargados',
];

const events = [
  {
    date: 'Lun 22',
    title: 'Reunion administrativa',
    detail: 'Revision de agenda semanal',
  },
  {
    date: 'Mie 24',
    title: 'Entrega de avances',
    detail: 'Profesores registran calificaciones',
  },
  {
    date: 'Vie 26',
    title: 'Comunicado institucional',
    detail: 'Publicacion para familias',
  },
];

const ModernDash = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <div className="overflow-hidden rounded-lg bg-primary text-white">
          <div className="grid min-h-[360px] grid-cols-12">
            <div className="col-span-12 flex flex-col justify-between p-7 lg:col-span-7 lg:p-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
                  Sistema institucional
                </p>
                <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white lg:text-5xl">
                  Gestion escolar clara, centralizada y hecha para el colegio.
                </h1>
                <p className="mt-5 max-w-xl text-base text-white/75">
                  Una base visual para administrar comunidad educativa, matricula, asistencia,
                  evaluaciones y comunicados desde un portal sobrio y moderno.
                </p>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-6">
                <div>
                  <p className="text-3xl font-semibold text-secondary">842</p>
                  <p className="text-xs text-white/70">Estudiantes</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-secondary">58</p>
                  <p className="text-xs text-white/70">Docentes</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold text-secondary">94%</p>
                  <p className="text-xs text-white/70">Asistencia</p>
                </div>
              </div>
            </div>
            <div className="relative col-span-12 min-h-[260px] overflow-hidden bg-[#061b4c] lg:col-span-5">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute left-8 top-8 h-56 w-28 rotate-6 rounded-t-full border border-white/20 bg-white/10" />
                <div className="absolute right-12 top-14 h-72 w-32 -rotate-6 rounded-t-full border border-white/20 bg-white/10" />
                <div className="absolute bottom-0 left-0 h-28 w-full bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute right-8 top-8 flex size-28 items-center justify-center rounded-md border border-secondary/50 bg-primary/80 text-secondary shadow-lg">
                <CostaRicaMark className="size-20" />
              </div>
              <div className="absolute bottom-8 left-8 right-8 rounded-md bg-white p-5 text-primary shadow-lg">
                <p className="text-sm font-semibold">Base frontend lista</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  React, TypeScript y Tailwind preparados para conectar con FastAPI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {stats.map((item) => (
        <div key={item.label} className="col-span-12 sm:col-span-6 xl:col-span-3">
          <CardBox className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <h2 className="mt-2 text-3xl font-semibold">{item.value}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.helper}</p>
              </div>
              <div className={`flex size-11 items-center justify-center rounded-md ${item.color}`}>
                <Icon icon={item.icon} width={22} height={22} />
              </div>
            </div>
          </CardBox>
        </div>
      ))}

      <div className="col-span-12 lg:col-span-8">
        <CardBox className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Modulos prioritarios</h2>
              <p className="text-sm text-muted-foreground">
                Estos son los bloques recomendados para construir primero.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {modules.map((module, index) => (
              <div key={module} className="rounded-md border border-ld p-4 transition-colors hover:border-secondary hover:bg-lightsecondary">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-secondary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{module}</span>
                </div>
              </div>
            ))}
          </div>
        </CardBox>
      </div>

      <div className="col-span-12 lg:col-span-4">
        <CardBox className="p-6">
          <h2 className="text-xl font-semibold">Agenda cercana</h2>
          <div className="mt-5 space-y-4">
            {events.map((event) => (
              <div key={event.title} className="flex gap-3">
                <div className="min-w-16 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold text-secondary">
                  {event.date}
                </div>
                <div>
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBox>
      </div>
    </div>
  );
};

export default ModernDash;
