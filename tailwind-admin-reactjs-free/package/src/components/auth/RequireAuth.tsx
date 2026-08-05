import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from 'src/context/auth-context';
import { canAccess, landingFor } from 'src/lib/roles';
import Spinner from 'src/views/spinner/Spinner';

const RequireAuth = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  // Un visitante sin sesion ve primero el sitio institucional; el acceso al
  // panel se hace desde el boton "Ingresar" del sitio publico.
  if (!isAuthenticated) return <Navigate to="/inicio" replace />;

  const role = user?.rol.name_rol;
  if (!canAccess(role, location.pathname)) {
    return <Navigate to={landingFor(role)} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
