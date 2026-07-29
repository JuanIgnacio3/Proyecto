import { Icon } from '@iconify/react';
import Container from 'src/components/public/Container';
import SectionHeader from 'src/components/public/SectionHeader';
import { Button } from 'src/components/ui/button';
import { contacto } from 'src/content/contacto';

const isExternal = (href?: string) => !!href && /^https?:/.test(href);

/**
 * Seccion Contacto. Cierra el recorrido tras Admision (navy) con una superficie
 * clara. Informativa: medios oficiales + mapa simple. Reutiliza Container,
 * Kicker y Button; los canales son una lista propia de la seccion (sin componente
 * nuevo).
 */
const Contacto = () => (
  <section id="contacto" className="scroll-mt-20 bg-slate-50 text-dark">
    <Container className="py-24 sm:py-32">
      <SectionHeader
        kicker={contacto.kicker}
        title={contacto.title}
        lead={contacto.lead}
        className="max-w-2xl"
      />

      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Medios oficiales */}
        <ul className="space-y-6">
          {contacto.channels.map((c) => (
            <li key={c.label} className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon icon={c.icon} className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-500">{c.label}</p>
                {c.href ? (
                  <a
                    href={c.href}
                    {...(isExternal(c.href)
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="font-medium break-words text-dark transition-colors hover:text-primary"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="font-medium text-dark">
                    {c.value}
                    {c.pending ? <span className="ml-2 text-xs text-slate-400">(pendiente)</span> : null}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Mapa */}
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <iframe
              title="Ubicación del CTP San Pedro de Barva en Google Maps"
              src={contacto.mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full"
            />
          </div>
          <Button asChild variant="outline" shape="pill" className="mt-4">
            <a href={contacto.mapsHref} target="_blank" rel="noopener noreferrer">
              Cómo llegar
              <Icon icon="solar:map-point-linear" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </Container>
  </section>
);

export default Contacto;
