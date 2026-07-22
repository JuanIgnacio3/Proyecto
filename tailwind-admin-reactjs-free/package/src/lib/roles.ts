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
  ],
  Encargado: ['/reportes'],
  Estudiante: ['/reportes'],
};

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
