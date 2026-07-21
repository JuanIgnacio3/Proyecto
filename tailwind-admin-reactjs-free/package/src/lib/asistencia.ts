import { api } from './api';
import type { AsistenciaBatchIn, AsistenciaRoster } from 'src/types/asistencia';

export function getRoster(idGrupo: number, fecha: string): Promise<AsistenciaRoster> {
  return api.get<AsistenciaRoster>(`/asistencia/?id_grupo=${idGrupo}&fecha=${fecha}`);
}

export function saveRoster(payload: AsistenciaBatchIn): Promise<AsistenciaRoster> {
  return api.put<AsistenciaRoster>('/asistencia/', payload);
}
