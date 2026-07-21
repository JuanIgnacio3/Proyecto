import type { Usuario } from 'src/types/estudiante';

export interface EstudianteMini {
  id_estudiante: number;
  name_estudiante: string;
  sec_name_estudiante: string;
}

export interface Encargado {
  id_encargado: number;
  name_encargado: string;
  sec_name_encargado: string;
  id_tipo_documento: number;
  num_documento_encargado: string;
  phone_num_encargado: string | null;
  direction_encargado: string | null;
  parentesco: string;
  usuario: Usuario;
  estudiantes: EstudianteMini[];
}

export interface EncargadoCreate {
  correo_institucional: string;
  password: string;
  name_encargado: string;
  sec_name_encargado: string;
  id_tipo_documento: number;
  num_documento_encargado: string;
  phone_num_encargado?: string | null;
  direction_encargado?: string | null;
  parentesco: string;
  estudiantes_ids: number[];
}

export interface EncargadoUpdate {
  name_encargado: string;
  sec_name_encargado: string;
  id_tipo_documento: number;
  num_documento_encargado: string;
  phone_num_encargado?: string | null;
  direction_encargado?: string | null;
  parentesco: string;
  estudiantes_ids: number[];
}
