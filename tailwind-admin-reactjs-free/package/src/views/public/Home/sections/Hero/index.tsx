import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import { Button } from 'src/components/ui/button';
import { cn } from 'src/lib/utils';
import { hero } from 'src/content/hero';

/**
 * Reveal de entrada escalonado. Solo se activa cuando el usuario no pide
 * reducir el movimiento (motion-safe); en caso contrario el contenido aparece
 * visible sin animacion. `fill-mode-both` mantiene el estado inicial durante el
 * retardo para que el escalonado se perciba limpio.
 */
const reveal =
  'motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 ' +
  'motion-safe:duration-700 motion-safe:fill-mode-both motion-safe:ease-out';

/**
 * Seccion Hero del sitio publico. Primera impresion del proyecto: titular
 * protagonista, mucho aire y una unica llamada a la accion. El fondo se
 * construye con capas de luz (sin imagenes externas) para dar profundidad
 * premium; si mas adelante hay una fotografia institucional, se activa via
 * `hero.backgroundImage` sin tocar este componente.
 */
const Hero = () => (
  <section
    id="inicio"
    className="relative isolate flex min-h-svh scroll-mt-20 items-center overflow-hidden bg-primary text-white"
  >
    {hero.backgroundImage ? (
      <>
        {/* Fotografia institucional (fuente de datos: hero.backgroundImage) */}
        <img
          src={hero.backgroundImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 size-full object-cover object-center"
        />
        {/* Legibilidad: oscurecido navy hacia la zona de texto (izquierda) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-primary/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/40"
        />
      </>
    ) : (
      <>
        {/* Halo calido (identidad: oro institucional) en la esquina superior */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(55rem_55rem_at_82%_-12%,rgba(215,179,90,0.20),transparent_60%)]"
        />
        {/* Profundidad navy en la esquina inferior opuesta */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_48rem_at_-8%_112%,rgba(11,52,141,0.6),transparent_60%)]"
        />
        {/* Reticula tecnologica sutil, desvanecida hacia los bordes con mascara */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(70%_60%_at_50%_40%,#000,transparent)]"
        />
        {/* Marca institucional como elemento grafico intencional */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 lg:block"
        >
          <CostaRicaMark className="size-[34rem] text-white/[0.06]" />
        </div>
        {/* Desvanecido inferior: legibilidad y transicion hacia la siguiente seccion */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-black/25"
        />
      </>
    )}

    <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-8">
      <div className="max-w-3xl py-28 sm:py-36">
        {/* Kicker institucional */}
        <div className={cn(reveal, 'flex items-center gap-3 text-secondary')}>
          <span className="h-px w-8 bg-secondary/70" />
          <p className="text-xs font-semibold uppercase tracking-[0.25em]">{hero.eyebrow}</p>
        </div>

        <h1
          className={cn(
            reveal,
            'mt-6 text-balance font-[\'Bricolage_Grotesque\'] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl',
            'motion-safe:[animation-delay:120ms]',
          )}
        >
          {hero.title}
        </h1>

        <p
          className={cn(
            reveal,
            'mt-6 max-w-xl text-pretty text-lg text-white/75',
            'motion-safe:[animation-delay:220ms]',
          )}
        >
          {hero.subtitle}
        </p>

        <div
          className={cn(
            reveal,
            'mt-10 flex flex-wrap items-center gap-4',
            'motion-safe:[animation-delay:320ms]',
          )}
        >
          {hero.ctas.map((cta) => (
            <Button
              key={cta.href}
              asChild
              size="lg"
              shape="pill"
              variant={cta.variant === 'primary' ? 'secondary' : 'outline'}
              className={
                cta.variant === 'primary'
                  ? 'group bg-white text-primary shadow-lg hover:bg-white/90'
                  : 'group border-white/60 text-white hover:bg-white hover:text-primary'
              }
            >
              <Link to={cta.href}>
                {cta.label}
                <Icon
                  icon="solar:arrow-right-linear"
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Link>
            </Button>
          ))}
        </div>

        {/* Anclaje a la comunidad */}
        <p
          className={cn(
            reveal,
            'mt-10 flex items-center gap-2 text-sm text-white/55',
            'motion-safe:[animation-delay:420ms]',
          )}
        >
          <Icon icon="solar:map-point-linear" aria-hidden="true" className="size-4" />
          {hero.location}
        </p>
      </div>
    </div>

    {/* Indicador de scroll */}
    <div
      aria-hidden="true"
      className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 motion-safe:animate-bounce"
    >
      <Icon icon="solar:alt-arrow-down-linear" width={26} height={26} />
    </div>
  </section>
);

export default Hero;
