import type { Asignatura } from 'src/types/asignatura';

export interface Grupo {
  id_grupo: number;
  name_grupo: string;
  grado: string | null;
  activo: boolean;
  // La materia dejo de vivir en el grupo (se asigna por profesor). Puede venir
  // null en grupos nuevos; se conserva por compatibilidad.
  id_asignatura: number | null;
  asignatura: Asignatura | null;
}

export interface GrupoInput {
  name_grupo: string;
  grado: string;
}
