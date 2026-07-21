import { api } from './api';
import type { Profesor, ProfesorCreate, ProfesorUpdate } from 'src/types/profesor';

export function listProfesores(): Promise<Profesor[]> {
  return api.get<Profesor[]>('/profesores/');
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
