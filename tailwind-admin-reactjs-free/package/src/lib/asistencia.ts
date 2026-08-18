import { api } from './api';
import type { AsistenciaBatchIn, AsistenciaRoster } from 'src/types/asistencia';

export function getRoster(
  idClase: number,
  periodo: number,
  fecha: string,
): Promise<AsistenciaRoster> {
  return api.get<AsistenciaRoster>(
    `/asistencia/?id_profesor_asignatura_grupo=${idClase}&periodo=${periodo}&fecha=${fecha}`,
  );
}

export function saveRoster(payload: AsistenciaBatchIn): Promise<AsistenciaRoster> {
  return api.put<AsistenciaRoster>('/asistencia/', payload);
}
