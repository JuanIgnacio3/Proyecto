import { api } from './api';
import type {
  Estudiante,
  EstudianteCreate,
  Grupo,
  TipoDocumento,
} from 'src/types/estudiante';

export function listEstudiantes(): Promise<Estudiante[]> {
  return api.get<Estudiante[]>('/estudiantes/');
}

export function createEstudiante(payload: EstudianteCreate): Promise<Estudiante> {
  return api.post<Estudiante>('/estudiantes/', payload);
}

export function deactivateEstudiante(id: number): Promise<void> {
  return api.del<void>(`/estudiantes/${id}`);
}

export function listTiposDocumento(): Promise<TipoDocumento[]> {
  return api.get<TipoDocumento[]>('/catalogos/tipos-documento');
}

export function listGrupos(): Promise<Grupo[]> {
  return api.get<Grupo[]>('/catalogos/grupos');
}
