export interface Especialidad {
  id_especialidad: number;
  nombre: string;
  descripcion: string;
  nivel: string;
  salida_laboral: string | null;
  imagen: string | null;
  es_publico: boolean;
  orden: number;
}

export interface EspecialidadInput {
  nombre: string;
  descripcion: string;
  nivel: string;
  salida_laboral: string | null;
  imagen: string | null;
  es_publico: boolean;
  orden: number;
}
