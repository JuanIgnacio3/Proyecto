import { api } from './api';
import type { Especialidad, EspecialidadInput } from 'src/types/especialidad';

export function listEspecialidades(): Promise<Especialidad[]> {
  return api.get<Especialidad[]>('/especialidades/');
}

export function createEspecialidad(payload: EspecialidadInput): Promise<Especialidad> {
  return api.post<Especialidad>('/especialidades/', payload);
}

export function updateEspecialidad(
  id: number,
  payload: EspecialidadInput,
): Promise<Especialidad> {
  return api.put<Especialidad>(`/especialidades/${id}`, payload);
}

export function deleteEspecialidad(id: number): Promise<void> {
  return api.del<void>(`/especialidades/${id}`);
}
