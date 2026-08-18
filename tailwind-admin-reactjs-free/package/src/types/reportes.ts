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

export interface ItemNota {
  id_evaluacion: number;
  name_evaluacion: string;
  porcentaje: number;
  fecha: string | null;
  valor: number | null;
  contribucion: number | null;
}

export interface RubroReporte {
  tipo: string; // Examen | Tarea | Cotidiano
  peso: number;
  items: ItemNota[];
  contribucion: number | null;
}

export interface AsistenciaRubro {
  peso: number;
  total_registros: number;
  presentes: number;
  porcentaje_presente: number | null;
  contribucion: number | null;
  por_estado: ConteoEstado[];
}

export interface PeriodoReporte {
  periodo: number;
  rubros: RubroReporte[];
  asistencia: AsistenciaRubro;
  peso_total: number;
  nota_periodo: number | null;
}

export interface MateriaReporte {
  id_clase: number;
  materia: string;
  profesor: string;
  porcentaje_asistencia: number;
  periodos: PeriodoReporte[];
  nota_final: number | null;
}

export interface ReporteEstudiante {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  grupo: string | null;
  materias: MateriaReporte[];
}
