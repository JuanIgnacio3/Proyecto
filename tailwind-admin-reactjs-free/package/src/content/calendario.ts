// Contenido editorial de la seccion "Calendario".
// Los EVENTOS provienen del backend publico (GET /api/public/v1/calendar, via el
// hook usePublicCalendar). Aqui solo vive el texto editorial: encabezado y
// mensajes de estado. Las tarjetas reutilizan NewsCard (mismo patron que Noticias).

export type CalendarioContent = {
  kicker: string;
  title: string;
  lead: string;
  /** Mensaje institucional cuando el backend no devuelve eventos. */
  emptyMessage: string;
  /** Mensaje discreto si la carga falla. */
  errorMessage: string;
};

export const calendario: CalendarioContent = {
  kicker: 'Calendario',

  // [EDITORIAL/PROVISIONAL]
  title: 'Próximas actividades',

  // [EDITORIAL/PROVISIONAL]
  lead: 'Fechas, eventos y actividades de la comunidad institucional.',

  emptyMessage: 'Pronto publicaremos las próximas actividades del colegio.',
  errorMessage: 'No fue posible cargar el calendario en este momento.',
};
