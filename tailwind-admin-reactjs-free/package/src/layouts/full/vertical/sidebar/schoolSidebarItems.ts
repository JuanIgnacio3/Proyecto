export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: string;
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: string;
  id?: number | string;
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
}

const SchoolSidebarContent: MenuItem[] = [
  {
    heading: 'General',
    children: [
      {
        id: 'dashboard',
        name: 'Panel principal',
        icon: 'solar:home-2-linear',
        url: '/',
      },
      {
        id: 'calendar',
        name: 'Calendario',
        icon: 'solar:calendar-linear',
        url: '/calendario',
      },
      {
        id: 'announcements',
        name: 'Comunicados',
        icon: 'solar:notification-unread-linear',
        url: '/comunicados',
      },
    ],
  },
  {
    heading: 'Comunidad educativa',
    children: [
      {
        id: 'students',
        name: 'Estudiantes',
        icon: 'solar:user-rounded-linear',
        url: '/estudiantes',
      },
      {
        id: 'teachers',
        name: 'Profesores',
        icon: 'solar:square-academic-cap-linear',
        url: '/profesores',
      },
      {
        id: 'staff',
        name: 'Administrativos',
        icon: 'solar:users-group-rounded-linear',
        url: '/administrativos',
      },
      {
        id: 'guardians',
        name: 'Encargados',
        icon: 'solar:user-hand-up-linear',
        url: '/encargados',
      },
    ],
  },
  {
    heading: 'Gestion academica',
    children: [
      {
        id: 'groups',
        name: 'Grupos y secciones',
        icon: 'solar:layers-linear',
        url: '/grupos',
      },
      {
        id: 'subjects',
        name: 'Materias',
        icon: 'solar:notebook-bookmark-linear',
        url: '/materias',
      },
      {
        id: 'attendance',
        name: 'Asistencia',
        icon: 'solar:checklist-minimalistic-linear',
        url: '/asistencia',
      },
      {
        id: 'grades',
        name: 'Calificaciones',
        icon: 'solar:clipboard-check-linear',
        url: '/calificaciones',
      },
    ],
  },
  {
    heading: 'Administracion',
    children: [
      {
        id: 'enrollment',
        name: 'Matricula',
        icon: 'solar:document-add-linear',
        url: '/matricula',
      },
      {
        id: 'reports',
        name: 'Reportes',
        icon: 'solar:chart-square-linear',
        url: '/reportes',
      },
      {
        id: 'settings',
        name: 'Configuracion',
        icon: 'solar:settings-linear',
        url: '/configuracion',
      },
    ],
  },
];

export default SchoolSidebarContent;
