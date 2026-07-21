import { api } from './api';
import type { EstudianteDisponible, ReporteEstudiante } from 'src/types/reportes';

export function listEstudiantesDisponibles(): Promise<EstudianteDisponible[]> {
  return api.get<EstudianteDisponible[]>('/reportes/estudiantes-disponibles');
}

export function getReporteEstudiante(id: number): Promise<ReporteEstudiante> {
  return api.get<ReporteEstudiante>(`/reportes/estudiante/${id}`);
}
