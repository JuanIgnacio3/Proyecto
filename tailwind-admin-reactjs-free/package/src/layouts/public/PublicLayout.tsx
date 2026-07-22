import { Link, Outlet } from 'react-router';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';
import ScrollToTop from 'src/components/shared/ScrollToTop';

/**
 * Layout PUBLICO (sitio institucional para visitantes, sin autenticacion).
 *
 * Preparado para una fase futura: aun NO se enrutan paginas publicas ni se
 * exponen endpoints publicos. Se deja listo para envolver rutas fuera de
 * RequireAuth cuando se defina el modulo publico.
 *
 * Estructura sugerida en el router (no implementada todavia):
 *
 *   {
 *     element: <PublicLayout />,
 *     children: [
 *       { path: '/', element: <Inicio /> },
 *       { path: '/informacion', element: <Informacion /> },
 *       // ...paginas publicas
 *     ],
 *   }
 *
 * Reutiliza marca (FullLogo), tokens y primitives existentes; NO depende del
 * sidebar ni del contexto de autenticacion.
 */
const PublicLayout = () => (
  <ScrollToTop>
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-ld">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <FullLogo />
          </Link>
          {/* Navegacion publica: se definira junto con las paginas del modulo publico. */}
          <nav aria-label="Navegacion publica" className="flex items-center gap-4" />
        </div>
      </header>

      <main className="grow">
        <div className="container mx-auto px-6 py-10">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-ld">
        <div className="container mx-auto px-6 py-6 text-sm text-muted-foreground">
          Sistema institucional
        </div>
      </footer>
    </div>
  </ScrollToTop>
);

export default PublicLayout;
