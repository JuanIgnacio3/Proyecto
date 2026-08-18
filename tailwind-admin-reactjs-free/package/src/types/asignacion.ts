export interface AsignacionProfesorMini {
  id_profesor: number;
  name_profesor: string;
  sec_name_profesor: string;
}

export interface AsignacionAsignaturaMini {
  id_asignatura: number;
  name_asignatura: string;
}

export interface AsignacionGrupoMini {
  id_grupo: number;
  name_grupo: string;
}

export interface Asignacion {
  id_profesor_asignatura_grupo: number;
  id_profesor: number;
  id_grupo: number;
  id_asignatura: number;
  activo: boolean;
  porcentaje_asistencia: number;
  profesor: AsignacionProfesorMini;
  asignatura: AsignacionAsignaturaMini;
  grupo: AsignacionGrupoMini;
}

export interface AsignacionInput {
  id_profesor: number;
  id_grupo: number;
  id_asignatura: number;
  porcentaje_asistencia: number;
}
