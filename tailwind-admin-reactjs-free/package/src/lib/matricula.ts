import { api } from './api';
import type { EstudianteMatricula } from 'src/types/matricula';

export function listSinGrupo(): Promise<EstudianteMatricula[]> {
  return api.get<EstudianteMatricula[]>('/matricula/sin-grupo');
}

export function listPorGrupo(idGrupo: number): Promise<EstudianteMatricula[]> {
  return api.get<EstudianteMatricula[]>(`/matricula/grupo/${idGrupo}`);
}

export function setGrupoEstudiante(
  idEstudiante: number,
  idGrupo: number | null,
): Promise<EstudianteMatricula> {
  return api.put<EstudianteMatricula>(`/matricula/estudiante/${idEstudiante}`, {
    id_grupo: idGrupo,
  });
}

export function matriculaMasiva(
  idGrupo: number,
  estudiantesIds: number[],
): Promise<EstudianteMatricula[]> {
  return api.post<EstudianteMatricula[]>('/matricula/masiva', {
    id_grupo: idGrupo,
    estudiantes_ids: estudiantesIds,
  });
}
