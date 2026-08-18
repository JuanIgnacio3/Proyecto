import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import RequireAuth from '../components/auth/RequireAuth';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const PublicLayout = Loadable(lazy(() => import('../layouts/public/PublicLayout')));

// Sitio publico
const PublicHome = Loadable(lazy(() => import('../views/public/Home')));

// authentication

const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));

const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Modern = Loadable(lazy(() => import('../views/dashboards/Modern')));

const Usuarios = Loadable(lazy(() => import('../views/school/Usuarios')));
const Estudiantes = Loadable(lazy(() => import('../views/school/Estudiantes')));
const Profesores = Loadable(lazy(() => import('../views/school/Profesores')));
const Administrativos = Loadable(lazy(() => import('../views/school/Administrativos')));
const Materias = Loadable(lazy(() => import('../views/school/Materias')));
const Grupos = Loadable(lazy(() => import('../views/school/Grupos')));
const Encargados = Loadable(lazy(() => import('../views/school/Encargados')));
const Asistencia = Loadable(lazy(() => import('../views/school/Asistencia')));
const Calificaciones = Loadable(lazy(() => import('../views/school/Calificaciones')));
const Reportes = Loadable(lazy(() => import('../views/school/Reportes')));
const Matricula = Loadable(lazy(() => import('../views/school/Matricula')));
const Comunicados = Loadable(lazy(() => import('../views/school/Comunicados')));
const Calendario = Loadable(lazy(() => import('../views/school/Calendario')));
const Especialidades = Loadable(lazy(() => import('../views/school/Especialidades')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    element: <PublicLayout />,
    children: [{ path: '/inicio', element: <PublicHome /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', element: <Modern /> },
          { path: '/usuarios', element: <Usuarios /> },
          { path: '/estudiantes', element: <Estudiantes /> },
          { path: '/profesores', element: <Profesores /> },
          { path: '/administrativos', element: <Administrativos /> },
          { path: '/materias', element: <Materias /> },
          { path: '/grupos', element: <Grupos /> },
          { path: '/encargados', element: <Encargados /> },
          { path: '/asistencia', element: <Asistencia /> },
          { path: '/calificaciones', element: <Calificaciones /> },
          { path: '/reportes', element: <Reportes /> },
          { path: '/matricula', element: <Matricula /> },
          { path: '/comunicados', element: <Comunicados /> },
          { path: '/calendario', element: <Calendario /> },
          { path: '/especialidades', element: <Especialidades /> },
          { path: '*', element: <Navigate to="/auth/404" /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: '/auth/auth2/login', element: <Login2 /> },

      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
