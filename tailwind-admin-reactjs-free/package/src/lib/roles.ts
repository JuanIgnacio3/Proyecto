// Control de acceso por rol en el frontend. El backend siempre valida ademas;
// esto ordena la navegacion para que cada rol vea solo lo que le corresponde.

type Acceso = string[] | '*';

const ACCESO: Record<string, Acceso> = {
  Administrador: '*',
  Profesor: [
    '/',
    '/estudiantes',
    '/profesores',
    '/encargados',
    '/grupos',
    '/materias',
    '/subgrupos',
    '/asistencia',
    '/calificaciones',
    '/reportes',
    '/comunicados',
  ],
  Administrativo: [
    '/',
    '/estudiantes',
    '/encargados',
    '/matricula',
    '/reportes',
    '/comunicados',
  ],
  Encargado: ['/reportes', '/comunicados'],
  Estudiante: ['/reportes', '/comunicados'],
};

// Roles que pueden crear/editar registros de personas (estudiantes, encargados).
const ROLES_GESTION_PERSONAS = ['Administrador', 'Administrativo'];

export function canManagePersonas(role: string | undefined): boolean {
  return !!role && ROLES_GESTION_PERSONAS.includes(role);
}

// Roles que pueden publicar/editar comunicados institucionales.
const ROLES_GESTION_COMUNICADOS = ['Administrador', 'Administrativo'];

export function canManageComunicados(role: string | undefined): boolean {
  return !!role && ROLES_GESTION_COMUNICADOS.includes(role);
}

export function canAccess(role: string | undefined, path: string): boolean {
  if (!role) return false;
  const permitido = ACCESO[role];
  if (!permitido) return false;
  if (permitido === '*') return true;
  return permitido.includes(path);
}

export function landingFor(role: string | undefined): string {
  if (!role) return '/';
  const permitido = ACCESO[role];
  if (!permitido || permitido === '*') return '/';
  if (permitido.includes('/')) return '/';
  return permitido[0] ?? '/';
}
