import { Icon } from '@iconify/react';
import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import Container from 'src/components/public/Container';
import Kicker from 'src/components/public/Kicker';
import SectionHeader from 'src/components/public/SectionHeader';
import { historia } from 'src/content/historia';

/**
 * Seccion Historia e Identidad. Superficie clara FIJA (no depende del tema del
 * panel: la app arranca en modo oscuro y los tokens semanticos se invierten),
 * con cierre en franja navy (manifiesto). Cuatro movimientos: intro -> pilares
 * -> zona de confianza (ficha + cifras) -> manifiesto.
 */
const Historia = () => (
  <section id="historia" className="scroll-mt-20 bg-white text-dark">
    <Container className="py-24 sm:py-32">
      {/* 1 · Intro asimetrica: texto + imagen "aprender haciendo" */}
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <SectionHeader
          kicker={historia.kicker}
          title={historia.title}
          lead={historia.lead}
          leadClassName="max-w-xl"
        />

        {/* Slot de imagen; sin foto real, panel resiliente con la marca */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary text-white">
          {historia.image ? (
            <img
              src={historia.image}
              alt="Estudiantes del CTP San Pedro de Barva en práctica técnica"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(40rem_40rem_at_80%_-10%,rgba(215,179,90,0.22),transparent_60%)]" />
              <div className="pointer-events-none absolute -right-10 -bottom-10 opacity-[0.07]">
                <CostaRicaMark className="size-72" />
              </div>
              <div className="absolute bottom-6 left-6">
                <Kicker light>Aprender haciendo</Kicker>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2 · Pilares: diferenciadores reales */}
      <div className="mt-20 grid gap-10 sm:mt-24 sm:grid-cols-3 sm:gap-8">
        {historia.pillars.map((p) => (
          <div key={p.title}>
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon icon={p.icon} className="size-6" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-dark">{p.title}</h3>
            <p className="mt-2 text-pretty text-slate-600">{p.body}</p>
          </div>
        ))}
      </div>

      {/* 3 · Zona de confianza: cifras (evidencia) + ficha institucional */}
      <div className="mt-20 border-t border-slate-200 pt-12 sm:mt-24">
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {historia.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-['Bricolage_Grotesque'] text-4xl font-semibold text-primary sm:text-5xl">
                  {s.value}
                </span>
                <span className="mt-1 block text-sm text-slate-500">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <dl className="mt-12 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {historia.facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {f.label}
              </dt>
              <dd className="mt-1 font-medium text-dark">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Container>

    {/* 4 · Manifiesto: franja navy, voz institucional */}
    <div className="bg-primary text-white">
      <Container className="py-20 sm:py-24">
        <Kicker light>Nuestro compromiso</Kicker>
        <p className="mt-6 max-w-3xl text-balance font-['Bricolage_Grotesque'] text-2xl font-medium leading-snug sm:text-3xl">
          {historia.manifesto}
        </p>
      </Container>
    </div>
  </section>
);

export default Historia;
