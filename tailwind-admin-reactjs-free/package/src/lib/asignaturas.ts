import { api } from './api';
import type { Asignatura, AsignaturaInput } from 'src/types/asignatura';

export function listAsignaturas(): Promise<Asignatura[]> {
  return api.get<Asignatura[]>('/asignaturas/');
}

export function createAsignatura(payload: AsignaturaInput): Promise<Asignatura> {
  return api.post<Asignatura>('/asignaturas/', payload);
}

export function updateAsignatura(
  id: number,
  payload: AsignaturaInput,
): Promise<Asignatura> {
  return api.put<Asignatura>(`/asignaturas/${id}`, payload);
}

export function deleteAsignatura(id: number): Promise<void> {
  return api.del<void>(`/asignaturas/${id}`);
}
