import { api } from './api';
import type { Subgrupo, SubgrupoCreate } from 'src/types/subgrupo';

export function listSubgrupos(): Promise<Subgrupo[]> {
  return api.get<Subgrupo[]>('/subgrupos/');
}

export function createSubgrupo(payload: SubgrupoCreate): Promise<Subgrupo> {
  return api.post<Subgrupo>('/subgrupos/', payload);
}

export function deleteSubgrupo(id: number): Promise<void> {
  return api.del<void>(`/subgrupos/${id}`);
}
