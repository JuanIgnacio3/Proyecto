export type Audiencia = 'Todos' | 'Estudiantes' | 'Profesores' | 'Encargados';

/** Categorias publicas controladas (coinciden con el enum del backend). */
export type CategoriaPublica = 'Institucional' | 'Académico' | 'Admisión' | 'Eventos' | 'Logros';

export interface Comunicado {
  id_comunicado: number;
  titulo: string;
  cuerpo: string;
  dirigido_a: Audiencia;
  es_publico: boolean;
  categoria: CategoriaPublica | null;
  fecha_publicacion: string;
  id_autor: number;
  autor_correo: string;
  activo: boolean;
}

export interface ComunicadoInput {
  titulo: string;
  cuerpo: string;
  dirigido_a: Audiencia;
  es_publico: boolean;
  categoria: CategoriaPublica | null;
}
