import { api } from './api';
import type { Encargado, EncargadoCreate } from 'src/types/encargado';

export function listEncargados(): Promise<Encargado[]> {
  return api.get<Encargado[]>('/encargados/');
}

export function createEncargado(payload: EncargadoCreate): Promise<Encargado> {
  return api.post<Encargado>('/encargados/', payload);
}

export function deactivateEncargado(id: number): Promise<void> {
  return api.del<void>(`/encargados/${id}`);
}
