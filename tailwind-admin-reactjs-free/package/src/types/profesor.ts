import type { Usuario } from 'src/types/estudiante';

export interface Profesor {
  id_profesor: number;
  name_profesor: string;
  sec_name_profesor: string;
  birthdate_profesor: string;
  direction_profesor: string | null;
  phone_num_profesor: string | null;
  id_tipo_documento: number;
  num_documento_profesor: string;
  id_grupo: number | null;
  usuario: Usuario;
}

export interface ProfesorCreate {
  correo_institucional: string;
  password: string;
  name_profesor: string;
  sec_name_profesor: string;
  birthdate_profesor: string;
  direction_profesor?: string | null;
  phone_num_profesor?: string | null;
  id_tipo_documento: number;
  num_documento_profesor: string;
  id_grupo?: number | null;
}

export interface ProfesorUpdate {
  name_profesor: string;
  sec_name_profesor: string;
  birthdate_profesor: string;
  direction_profesor?: string | null;
  phone_num_profesor?: string | null;
  id_tipo_documento: number;
  num_documento_profesor: string;
  id_grupo?: number | null;
}
