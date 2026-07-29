import { Icon } from '@iconify/react';
import Container from 'src/components/public/Container';
import SectionHeader from 'src/components/public/SectionHeader';
import { especialidades } from 'src/content/especialidades';

/**
 * Seccion Especialidades tecnicas. Superficie clara matizada FIJA (bg-slate-50),
 * para diferenciarse de Historia sin depender del tema. Muestra unicamente las
 * especialidades verificadas; la oferta completa queda marcada como provisional.
 */
const Especialidades = () => (
  <section id="especialidades" className="scroll-mt-20 bg-slate-50 text-dark">
    <Container className="py-24 sm:py-32">
      <SectionHeader
        kicker={especialidades.kicker}
        title={especialidades.title}
        lead={especialidades.lead}
        className="max-w-2xl"
      />

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {especialidades.items.map((e) => (
          <article
            key={e.name}
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

      {especialidades.note ? (
        <p className="mt-8 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <Icon icon="solar:info-circle-linear" aria-hidden="true" className="size-4 shrink-0" />
          {especialidades.note}
        </p>
      ) : null}
    </Container>
  </section>
);

export default Especialidades;
