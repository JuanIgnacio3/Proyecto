import type { Asignatura } from 'src/types/asignatura';

export interface Grupo {
  id_grupo: number;
  name_grupo: string;
  id_asignatura: number;
  activo: boolean;
  asignatura: Asignatura;
}

export interface GrupoInput {
  name_grupo: string;
  id_asignatura: number;
}
