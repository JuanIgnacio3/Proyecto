export interface Rol {
  id_rol: number;
  name_rol: string;
}

export interface Usuario {
  id_usuario: number;
  correo_institucional: string;
  activo: boolean;
  rol: Rol;
}

export interface Estudiante {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
  birthdate_estudiante: string;
  direction_estudiante: string | null;
  phone_num_estudiante: string | null;
  id_tipo_documento: number;
  num_documento_estudiante: string;
  id_grupo: number | null;
  usuario: Usuario;
}

export interface EstudianteCreate {
  correo_institucional: string;
  password: string;
  name_estudiante: string;
  sec_name_estudiante: string;
  birthdate_estudiante: string;
  direction_estudiante?: string | null;
  phone_num_estudiante?: string | null;
  id_tipo_documento: number;
  num_documento_estudiante: string;
  id_grupo?: number | null;
}

export interface TipoDocumento {
  id_tipo_documento: number;
  name_tipo_documento: string;
}

export interface Grupo {
  id_grupo: number;
  name_grupo: string;
  id_asignatura: number;
}
