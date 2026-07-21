import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import RequireAuth from '../components/auth/RequireAuth';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication

const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));

const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));

const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Modern = Loadable(lazy(() => import('../views/dashboards/Modern')));

const SchoolModulePage = Loadable(lazy(() => import('../views/school/SchoolModulePage')));
const Estudiantes = Loadable(lazy(() => import('../views/school/Estudiantes')));
const Profesores = Loadable(lazy(() => import('../views/school/Profesores')));
const Materias = Loadable(lazy(() => import('../views/school/Materias')));
const Grupos = Loadable(lazy(() => import('../views/school/Grupos')));
const Subgrupos = Loadable(lazy(() => import('../views/school/Subgrupos')));
const Encargados = Loadable(lazy(() => import('../views/school/Encargados')));
const Asistencia = Loadable(lazy(() => import('../views/school/Asistencia')));
const Calificaciones = Loadable(lazy(() => import('../views/school/Calificaciones')));
const Reportes = Loadable(lazy(() => import('../views/school/Reportes')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <FullLayout />,
        children: [
          { path: '/', element: <Modern /> },
          { path: '/estudiantes', element: <Estudiantes /> },
          { path: '/profesores', element: <Profesores /> },
          { path: '/materias', element: <Materias /> },
          { path: '/grupos', element: <Grupos /> },
          { path: '/subgrupos', element: <Subgrupos /> },
          { path: '/encargados', element: <Encargados /> },
          { path: '/asistencia', element: <Asistencia /> },
          { path: '/calificaciones', element: <Calificaciones /> },
          { path: '/reportes', element: <Reportes /> },
          {
            path: '/calendario',
        element: (
          <SchoolModulePage
            title="Calendario"
            description="Vista para actividades institucionales, reuniones, evaluaciones y eventos del curso lectivo."
            icon="solar:calendar-linear"
            primaryAction="Nuevo evento"
          />
        ),
      },
      {
        path: '/comunicados',
        element: (
          <SchoolModulePage
            title="Comunicados"
            description="Modulo para publicar avisos institucionales dirigidos a estudiantes, familias y personal."
            icon="solar:notification-unread-linear"
            primaryAction="Nuevo comunicado"
          />
        ),
      },
      {
        path: '/administrativos',
        element: (
          <SchoolModulePage
            title="Administrativos"
            description="Gestion del equipo administrativo, roles internos, informacion de contacto y responsabilidades."
            icon="solar:users-group-rounded-linear"
            primaryAction="Registrar administrativo"
          />
        ),
      },
      {
        path: '/matricula',
        element: (
          <SchoolModulePage
            title="Matricula"
            description="Proceso de ingreso, renovacion, estado de matricula y documentacion requerida."
            icon="solar:document-add-linear"
            primaryAction="Nueva matricula"
          />
        ),
      },
      {
        path: '/configuracion',
        element: (
          <SchoolModulePage
            title="Configuracion"
            description="Parametros institucionales, roles, permisos, periodos lectivos y ajustes generales."
            icon="solar:settings-linear"
            primaryAction="Nuevo ajuste"
          />
        ),
      },
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

      { path: '/auth/auth2/register', element: <Register2 /> },

      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
