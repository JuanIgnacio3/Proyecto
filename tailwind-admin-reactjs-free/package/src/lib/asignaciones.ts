import { api } from './api';
import type { Asignacion, AsignacionInput } from 'src/types/asignacion';

export function listAsignaciones(idGrupo: number): Promise<Asignacion[]> {
  return api.get<Asignacion[]>(`/asignaciones/?id_grupo=${idGrupo}`);
}

/** Clases (asignaciones activas) que el usuario puede gestionar: un profesor
 * ve solo las suyas; Administrador/Administrativo, todas. */
export function listMisClases(): Promise<Asignacion[]> {
  return api.get<Asignacion[]>('/asignaciones/mis-clases');
}

export function createAsignacion(payload: AsignacionInput): Promise<Asignacion> {
  return api.post<Asignacion>('/asignaciones/', payload);
}

export function deleteAsignacion(id: number): Promise<void> {
  return api.del<void>(`/asignaciones/${id}`);
}

export function activateAsignacion(id: number): Promise<Asignacion> {
  return api.put<Asignacion>(`/asignaciones/${id}`, { activo: true });
}

export function setAsistenciaAsignacion(id: number, porcentaje: number): Promise<Asignacion> {
  return api.put<Asignacion>(`/asignaciones/${id}`, { porcentaje_asistencia: porcentaje });
}
