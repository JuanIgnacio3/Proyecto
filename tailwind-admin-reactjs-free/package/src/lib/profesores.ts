import { api } from './api';
import type { Profesor, ProfesorCreate, ProfesorUpdate } from 'src/types/profesor';

export function listProfesores(soloActivos = false): Promise<Profesor[]> {
  const q = soloActivos ? '?activo=true' : '';
  return api.get<Profesor[]>(`/profesores/${q}`);
}

export function createProfesor(payload: ProfesorCreate): Promise<Profesor> {
  return api.post<Profesor>('/profesores/', payload);
}

export function updateProfesor(id: number, payload: ProfesorUpdate): Promise<Profesor> {
  return api.put<Profesor>(`/profesores/${id}`, payload);
}

export function deactivateProfesor(id: number): Promise<void> {
  return api.del<void>(`/profesores/${id}`);
}

export function activateProfesor(id: number): Promise<void> {
  return api.post<void>(`/profesores/${id}/activar`);
}
