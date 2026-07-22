import { api } from './api';
import type { Comunicado, ComunicadoInput } from 'src/types/comunicado';

export function listComunicados(): Promise<Comunicado[]> {
  return api.get<Comunicado[]>('/comunicados/');
}

export function createComunicado(payload: ComunicadoInput): Promise<Comunicado> {
  return api.post<Comunicado>('/comunicados/', payload);
}

export function updateComunicado(
  id: number,
  payload: ComunicadoInput,
): Promise<Comunicado> {
  return api.put<Comunicado>(`/comunicados/${id}`, payload);
}

export function deleteComunicado(id: number): Promise<void> {
  return api.del<void>(`/comunicados/${id}`);
}
