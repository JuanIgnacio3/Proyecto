import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import { Button } from 'src/components/ui/button';
import { cn } from 'src/lib/utils';
import { sectionLinks } from 'src/content/nav';

/**
 * Cabecera del sitio publico. Transparente sobre el hero y, al hacer scroll,
 * pasa a fondo solido con blur (comportamiento original). Se enriquece con la
 * navegacion por secciones (anclas): visible en escritorio y en un menu movil.
 */
const PublicHeader = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Solido cuando hay scroll o cuando el menu movil esta abierto (cohesion).
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        solid
          ? 'border-b border-border bg-background/80 text-foreground backdrop-blur'
          : 'border-b border-transparent bg-transparent text-white',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link
          to="/inicio"
          className="flex items-center gap-3"
          aria-label="Inicio"
          onClick={() => setOpen(false)}
        >
          <CostaRicaMark className="size-8" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            CTP San Pedro de Barva
          </span>
        </Link>

        {/* Navegacion de escritorio */}
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Principal">
          {sectionLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-opacity hover:opacity-70"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant={solid ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'rounded-full',
              !solid && 'border-white/60 text-white hover:bg-white hover:text-primary',
            )}
          >
            <Link to="/auth/auth2/login">Ingresar</Link>
          </Button>

          {/* Toggle del menu movil */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            className="inline-flex size-9 items-center justify-center rounded-md xl:hidden"
          >
            <Icon
              icon={open ? 'solar:close-square-linear' : 'solar:hamburger-menu-linear'}
              className="size-6"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Panel de navegacion movil */}
      {open ? (
        <nav className="border-t border-slate-200 bg-white text-dark xl:hidden" aria-label="Móvil">
          <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
            <ul className="flex flex-col">
              {sectionLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 text-base font-medium text-dark hover:text-primary"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </header>
  );
};

export default PublicHeader;
