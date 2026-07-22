import { api } from './api';
import type {
  Administrativo,
  AdministrativoCreate,
  AdministrativoUpdate,
} from 'src/types/administrativo';

export function listAdministrativos(): Promise<Administrativo[]> {
  return api.get<Administrativo[]>('/administrativos/');
}

export function createAdministrativo(
  payload: AdministrativoCreate,
): Promise<Administrativo> {
  return api.post<Administrativo>('/administrativos/', payload);
}

export function updateAdministrativo(
  id: number,
  payload: AdministrativoUpdate,
): Promise<Administrativo> {
  return api.put<Administrativo>(`/administrativos/${id}`, payload);
}

export function deactivateAdministrativo(id: number): Promise<void> {
  return api.del<void>(`/administrativos/${id}`);
}
