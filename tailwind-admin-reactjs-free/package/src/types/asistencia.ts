export type EstadoAsistencia = 'Presente' | 'Ausente' | 'Tardia' | 'Justificado';

export interface AsistenciaRosterItem {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  estado: EstadoAsistencia | null;
  observacion: string | null;
}

export interface AsistenciaRoster {
  id_grupo: number;
  fecha: string;
  registros: AsistenciaRosterItem[];
}

export interface AsistenciaRegistroIn {
  id_estudiante: number;
  estado: EstadoAsistencia;
  observacion?: string | null;
}

export interface AsistenciaBatchIn {
  id_grupo: number;
  fecha: string;
  registros: AsistenciaRegistroIn[];
}
