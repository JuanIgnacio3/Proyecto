import { api } from './api';
import type { Grupo, GrupoInput } from 'src/types/grupo';

export function listGrupos(): Promise<Grupo[]> {
  return api.get<Grupo[]>('/grupos/');
}

export function createGrupo(payload: GrupoInput): Promise<Grupo> {
  return api.post<Grupo>('/grupos/', payload);
}

export function updateGrupo(id: number, payload: GrupoInput): Promise<Grupo> {
  return api.put<Grupo>(`/grupos/${id}`, payload);
}

export function deleteGrupo(id: number): Promise<void> {
  return api.del<void>(`/grupos/${id}`);
}
