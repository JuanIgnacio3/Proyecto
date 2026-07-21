export interface EvaluacionGrupoMini {
  id_grupo: number;
  name_grupo: string;
}

export interface Evaluacion {
  id_evaluacion: number;
  name_evaluacion: string;
  periodo: number;
  porcentaje: number;
  fecha: string | null;
  id_grupo: number;
  grupo: EvaluacionGrupoMini;
}

export interface EvaluacionInput {
  name_evaluacion: string;
  periodo: number;
  porcentaje: number;
  fecha: string | null;
  id_grupo: number;
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
