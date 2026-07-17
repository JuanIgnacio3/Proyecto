import { Navigate, Outlet } from 'react-router';
import { useAuth } from 'src/context/auth-context';
import Spinner from 'src/views/spinner/Spinner';

const RequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/auth/auth2/login" replace />;

  return <Outlet />;
};

export default RequireAuth;
