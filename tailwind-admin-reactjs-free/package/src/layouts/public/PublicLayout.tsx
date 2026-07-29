import { Outlet } from 'react-router';
import ScrollToTop from 'src/components/shared/ScrollToTop';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';

/**
 * Layout del sitio PUBLICO (visitantes, sin autenticacion). Independiente del
 * layout administrativo: cabecera propia, sin sidebar ni RequireAuth. La
 * cabecera es fija y flota sobre el contenido (el hero ocupa la parte superior).
 */
const PublicLayout = () => (
  <ScrollToTop>
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="grow">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  </ScrollToTop>
);

export default PublicLayout;
