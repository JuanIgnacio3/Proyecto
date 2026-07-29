import { Link } from 'react-router';
import CostaRicaMark from 'src/components/brand/CostaRicaMark';
import Container from 'src/components/public/Container';
import { Button } from 'src/components/ui/button';
import { institucion } from 'src/content/institucion';
import { sectionLinks } from 'src/content/nav';

/**
 * Pie del sitio publico. Cierra el recorrido con superficie navy fija. Reune la
 * identidad, los medios oficiales (solo datos confirmados), los enlaces rapidos
 * a las secciones y el acceso al Portal. Reutiliza Container y Button.
 */
const PublicFooter = () => (
  <footer className="bg-dark text-white">
    <Container className="py-16">
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Identidad */}
        <div>
          <div className="flex items-center gap-3">
            <CostaRicaMark className="size-9 text-white" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              {institucion.nombreCorto}
            </span>
          </div>
          <p className="mt-4 text-sm text-white/70">{institucion.nombreOficial}</p>
          <p className="mt-2 text-sm text-white/60">{institucion.ubicacion}</p>
        </div>

        {/* Enlaces rapidos */}
        <nav aria-label="Secciones">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">Secciones</h2>
          <ul className="mt-4 space-y-2">
            {sectionLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contacto */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <a href={institucion.telefono.href} className="transition-colors hover:text-white">
                {institucion.telefono.value}
              </a>
            </li>
            <li>
              <a
                href={institucion.correo.href}
                className="break-words transition-colors hover:text-white"
              >
                {institucion.correo.value}
              </a>
            </li>
            <li>
              <a
                href={institucion.sitioWeb.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {institucion.sitioWeb.value}
              </a>
            </li>
            <li>
              <a
                href={institucion.facebook.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>

        {/* Portal */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white/90">Portal</h2>
          <p className="mt-4 text-sm text-white/70">
            Acceso para estudiantes, familias y personal.
          </p>
          <Button
            asChild
            variant="secondary"
            shape="pill"
            size="sm"
            className="mt-4 bg-white text-primary hover:bg-white/90"
          >
            <Link to={institucion.portalHref}>Ingresar al portal</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
        &copy; {new Date().getFullYear()} {institucion.nombreOficial}. Todos los derechos reservados.
      </div>
    </Container>
  </footer>
);

export default PublicFooter;
