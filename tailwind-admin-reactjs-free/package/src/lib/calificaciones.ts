import { api } from './api';
import type {
  Evaluacion,
  EvaluacionInput,
  NotasBatchIn,
  NotasRoster,
} from 'src/types/calificaciones';

export function listEvaluaciones(idGrupo: number): Promise<Evaluacion[]> {
  return api.get<Evaluacion[]>(`/evaluaciones/?id_grupo=${idGrupo}`);
}

export function createEvaluacion(payload: EvaluacionInput): Promise<Evaluacion> {
  return api.post<Evaluacion>('/evaluaciones/', payload);
}

export function updateEvaluacion(
  id: number,
  payload: EvaluacionInput,
): Promise<Evaluacion> {
  return api.put<Evaluacion>(`/evaluaciones/${id}`, payload);
}

export function deleteEvaluacion(id: number): Promise<void> {
  return api.del<void>(`/evaluaciones/${id}`);
}

export function getNotas(idEvaluacion: number): Promise<NotasRoster> {
  return api.get<NotasRoster>(`/evaluaciones/${idEvaluacion}/notas`);
}

export function saveNotas(
  idEvaluacion: number,
  payload: NotasBatchIn,
): Promise<NotasRoster> {
  return api.put<NotasRoster>(`/evaluaciones/${idEvaluacion}/notas`, payload);
}
