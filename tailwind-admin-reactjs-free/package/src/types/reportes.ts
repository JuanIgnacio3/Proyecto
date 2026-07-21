export interface EstudianteDisponible {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  grupo: string | null;
}

export interface ConteoEstado {
  estado: string;
  cantidad: number;
}

export interface AsistenciaReporte {
  total_registros: number;
  porcentaje_presente: number | null;
  por_estado: ConteoEstado[];
}

export interface NotaReporte {
  id_evaluacion: number;
  name_evaluacion: string;
  periodo: number;
  porcentaje: number;
  fecha: string | null;
  valor: number | null;
}

export interface ReporteEstudiante {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  grupo: string | null;
  asistencia: AsistenciaReporte;
  notas: NotaReporte[];
}
