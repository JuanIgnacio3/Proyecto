import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import Container from 'src/components/public/Container';
import SectionHeader from 'src/components/public/SectionHeader';
import { vidaEstudiantil } from 'src/content/vida-estudiantil';

/**
 * Seccion Vida estudiantil. Banda inmersiva navy (arquitectura: rompe el ritmo
 * de lectura con emocion y pertenencia), tras Especialidades (clara). Foto-
 * dependiente: sin imagen real usa el fondo inmersivo de fallback. Reutiliza
 * Container y Kicker; sin componentes nuevos.
 */
const VidaEstudiantil = () => (
  <section
    id="vida-estudiantil"
    className="relative isolate scroll-mt-20 overflow-hidden bg-primary text-white"
  >
    {vidaEstudiantil.image ? (
      <>
        <img
          src={vidaEstudiantil.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/20"
        />
      </>
    ) : (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_50rem_at_85%_-10%,rgba(215,179,90,0.18),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 bottom-0 opacity-[0.06]"
        >
          <CostaRicaMark className="size-[32rem]" />
        </div>
      </>
    )}

    <Container className="relative py-24 sm:py-32">
      <SectionHeader
        kicker={vidaEstudiantil.kicker}
        title={vidaEstudiantil.title}
        lead={vidaEstudiantil.lead}
        tone="dark"
        className="max-w-2xl"
      />

      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        {vidaEstudiantil.facets.map((f) => (
          <div key={f.title} className="border-t border-secondary/60 pt-5">
            <h3 className="text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-pretty text-white/70">{f.body}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
);

export default VidaEstudiantil;
