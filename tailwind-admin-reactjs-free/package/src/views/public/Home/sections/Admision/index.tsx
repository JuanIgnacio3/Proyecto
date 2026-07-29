import { Icon } from '@iconify/react';
import Container from 'src/components/public/Container';
import SectionHeader from 'src/components/public/SectionHeader';
import { Button } from 'src/components/ui/button';
import { admision } from 'src/content/admision';

/**
 * Seccion Admision / Matricula. Banda navy de conversion (arquitectura), tras
 * Noticias (clara). Es el principal punto de conversion del sitio: pasos claros
 * y un CTA evidente hacia el proceso oficial de admision. Reutiliza Container,
 * Kicker y Button; sin componentes nuevos.
 */
const Admision = () => (
  <section id="admision" className="relative isolate scroll-mt-20 overflow-hidden bg-primary text-white">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_50rem_at_85%_-10%,rgba(215,179,90,0.16),transparent_60%)]"
    />

    <Container className="relative py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHeader
            kicker={admision.kicker}
            title={admision.title}
            lead={admision.lead}
            tone="dark"
            leadClassName="max-w-xl"
          />

          <div className="mt-10">
            <Button
              asChild
              size="lg"
              shape="pill"
              variant="secondary"
              className="group bg-white text-primary shadow-lg hover:bg-white/90"
            >
              <a href={admision.primaryCta.href} target="_blank" rel="noopener noreferrer">
                {admision.primaryCta.label}
                <Icon
                  icon="solar:arrow-right-up-linear"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </a>
            </Button>
          </div>

          {admision.note ? (
            <p className="mt-6 max-w-xl text-sm text-white/60">{admision.note}</p>
          ) : null}
        </div>

        <ol className="grid gap-4">
          {admision.steps.map((step, i) => (
            <li
              key={step.title}
              className="flex items-start gap-4 rounded-xl border border-white/15 bg-white/5 p-4"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <span className="pt-1 text-pretty text-white/90">{step.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </Container>
  </section>
);

export default Admision;
