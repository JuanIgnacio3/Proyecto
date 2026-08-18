export interface EvaluacionGrupoMini {
  id_grupo: number;
  name_grupo: string;
}

export interface EvaluacionAsignacion {
  id_profesor_asignatura_grupo: number;
  profesor: { id_profesor: number; name_profesor: string; sec_name_profesor: string };
  asignatura: { id_asignatura: number; name_asignatura: string };
}

export type TipoRubro = 'Examen' | 'Tarea' | 'Cotidiano';

export interface Evaluacion {
  id_evaluacion: number;
  name_evaluacion: string;
  tipo: TipoRubro;
  periodo: number;
  porcentaje: number;
  fecha: string | null;
  id_grupo: number;
  activo: boolean;
  grupo: EvaluacionGrupoMini;
  id_profesor_asignatura_grupo: number | null;
  asignacion: EvaluacionAsignacion | null;
}

export interface EvaluacionInput {
  name_evaluacion: string;
  tipo: TipoRubro;
  periodo: number;
  porcentaje: number;
  fecha: string | null;
  /** Nuevo modelo: la evaluacion cuelga de una asignacion profesor+materia. */
  id_profesor_asignatura_grupo?: number;
  /** Compatibilidad: crear directamente por grupo (sin asignacion). */
  id_grupo?: number;
}

export interface NotaRosterItem {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  valor: number | null;
}

export interface NotasRoster {
  id_evaluacion: number;
  name_evaluacion: string;
  registros: NotaRosterItem[];
}

export interface NotaRegistroIn {
  id_estudiante: number;
  valor: number | null;
}

export interface NotasBatchIn {
  registros: NotaRegistroIn[];
}
