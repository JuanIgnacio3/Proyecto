export type TipoEvento =
  | 'Reunion'
  | 'Evaluacion'
  | 'Actividad'
  | 'Feriado'
  | 'Entrega'
  | 'Otro';

export interface Evento {
  id_evento: number;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  tipo: TipoEvento;
  es_publico: boolean;
}

export interface EventoInput {
  titulo: string;
  descripcion?: string | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  tipo: TipoEvento;
  es_publico: boolean;
}
