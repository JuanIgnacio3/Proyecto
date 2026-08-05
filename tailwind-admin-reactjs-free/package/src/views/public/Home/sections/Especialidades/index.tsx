import { Icon } from '@iconify/react';
import Container from 'src/components/public/Container';
import SectionHeader from 'src/components/public/SectionHeader';
import { especialidades } from 'src/content/especialidades';
import { usePublicSpecialties } from 'src/hooks/usePublicSpecialties';

const GRID = 'mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

/**
 * Seccion Especialidades tecnicas. Superficie clara matizada FIJA (bg-slate-50).
 * El encabezado es editorial; las tarjetas provienen del endpoint publico
 * GET /api/public/v1/specialties via usePublicSpecialties. La UI (grid, tarjeta,
 * ritmo) es la del MVP; solo cambia la fuente de datos.
 */
const Especialidades = () => {
  const { specialties, loading, error } = usePublicSpecialties(6);

  return (
    <section id="especialidades" className="scroll-mt-20 bg-slate-50 text-dark">
      <Container className="py-24 sm:py-32">
        <SectionHeader
          kicker={especialidades.kicker}
          title={especialidades.title}
          lead={especialidades.lead}
          className="max-w-2xl"
        />

        {loading ? (
          <div className={GRID} aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="size-12 animate-pulse rounded-xl bg-slate-100" />
                <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="mt-16 text-slate-500">{especialidades.errorMessage}</p>
        ) : specialties.length === 0 ? (
          <p className="mt-16 text-slate-600">{especialidades.emptyMessage}</p>
        ) : (
          <div className={GRID}>
            {specialties.map((e) => (
              <article
                key={e.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon icon={e.icon} className="size-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-dark">{e.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{e.level}</p>
                <p className="mt-3 text-pretty text-slate-600">{e.description}</p>
              </article>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};

export default Especialidades;
