import { api } from './api';
import type {
  Estudiante,
  EstudianteCreate,
  EstudianteUpdate,
  Grupo,
  TipoDocumento,
} from 'src/types/estudiante';

export function listEstudiantes(): Promise<Estudiante[]> {
  return api.get<Estudiante[]>('/estudiantes/');
}

export function createEstudiante(payload: EstudianteCreate): Promise<Estudiante> {
  return api.post<Estudiante>('/estudiantes/', payload);
}

export function updateEstudiante(
  id: number,
  payload: EstudianteUpdate,
): Promise<Estudiante> {
  return api.put<Estudiante>(`/estudiantes/${id}`, payload);
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
