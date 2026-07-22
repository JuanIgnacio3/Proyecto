export type Audiencia = 'Todos' | 'Estudiantes' | 'Profesores' | 'Encargados';

export interface Comunicado {
  id_comunicado: number;
  titulo: string;
  cuerpo: string;
  dirigido_a: Audiencia;
  fecha_publicacion: string;
  id_autor: number;
  autor_correo: string;
}

export interface ComunicadoInput {
  titulo: string;
  cuerpo: string;
  dirigido_a: Audiencia;
}
