import type { Usuario } from 'src/types/estudiante';

export interface Administrativo {
  id_administrativo: number;
  name_administrativo: string;
  sec_name_administrativo: string;
  id_tipo_documento: number;
  num_documento_administrativo: string;
  phone_num_administrativo: string | null;
  direction_administrativo: string | null;
  cargo: string;
  usuario: Usuario;
}

export interface AdministrativoCreate {
  correo_institucional: string;
  password: string;
  name_administrativo: string;
  sec_name_administrativo: string;
  id_tipo_documento: number;
  num_documento_administrativo: string;
  phone_num_administrativo?: string | null;
  direction_administrativo?: string | null;
  cargo: string;
}

export interface AdministrativoUpdate {
  name_administrativo: string;
  sec_name_administrativo: string;
  id_tipo_documento: number;
  num_documento_administrativo: string;
  phone_num_administrativo?: string | null;
  direction_administrativo?: string | null;
  cargo: string;
}
