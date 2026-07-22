import { api } from './api';
import type { Evento, EventoInput } from 'src/types/evento';

export function listEventos(): Promise<Evento[]> {
  return api.get<Evento[]>('/eventos/');
}

export function createEvento(payload: EventoInput): Promise<Evento> {
  return api.post<Evento>('/eventos/', payload);
}

export function updateEvento(id: number, payload: EventoInput): Promise<Evento> {
  return api.put<Evento>(`/eventos/${id}`, payload);
}

export function deleteEvento(id: number): Promise<void> {
  return api.del<void>(`/eventos/${id}`);
}
