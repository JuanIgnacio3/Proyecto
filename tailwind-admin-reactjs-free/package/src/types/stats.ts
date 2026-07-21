export interface ConteoItem {
  etiqueta: string;
  cantidad: number;
}

export interface AsistenciaResumen {
  total_registros: number;
  presentes: number;
  porcentaje_presente: number | null;
}

export interface DashboardStats {
  estudiantes_activos: number;
  profesores_activos: number;
  encargados_activos: number;
  grupos: number;
  materias: number;
  subgrupos: number;
  evaluaciones: number;
  promedio_general_notas: number | null;
  asistencia: AsistenciaResumen;
  distribucion_asistencia: ConteoItem[];
  estudiantes_por_grupo: ConteoItem[];
}
