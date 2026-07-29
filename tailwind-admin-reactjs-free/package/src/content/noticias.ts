// Contenido TEMPORAL de la seccion "Noticias".
//
// [PLACEHOLDER] Todas las noticias de este arreglo son contenido de ejemplo, NO
// noticias reales del colegio. El objetivo de esta fase es validar la UI, no el
// contenido. Cuando exista el endpoint publico de comunicados, se reemplaza esta
// fuente de datos por la respuesta del backend: el componente NewsCard y la
// seccion NO cambian (misma forma de `NewsItem`).
//
// `NewsItem` refleja la forma esperada de un comunicado publico:
//   id, tag (audiencia/categoria), title, summary, date (ISO, opcional).

export type NewsItem = {
  id: string;
  tag: string;
  title: string;
  summary: string;
  /** Fecha ISO (opcional). En los placeholders se omite: no se inventan fechas. */
  date?: string;
};

export type NoticiasContent = {
  kicker: string;
  title: string;
  lead: string;
  items: NewsItem[];
  /** Aviso de que el contenido es temporal. */
  note?: string;
};

export const noticias: NoticiasContent = {
  kicker: 'Noticias',

  // [EDITORIAL/PROVISIONAL]
  title: 'Lo que sucede en el colegio',

  // [EDITORIAL/PROVISIONAL]
  lead: 'Comunicados oficiales, actividades y novedades de la comunidad estudiantil.',

  // [PLACEHOLDER] contenido de ejemplo, no noticias reales.
  items: [
    {
      id: '1',
      tag: 'Comunicados',
      title: 'Espacio para comunicados institucionales',
      summary:
        'Aquí aparecerán los comunicados oficiales del colegio cuando el sistema esté conectado.',
    },
    {
      id: '2',
      tag: 'Actividades',
      title: 'Próximas actividades',
      summary: 'Este espacio mostrará las próximas actividades y eventos de la institución.',
    },
    {
      id: '3',
      tag: 'Avisos',
      title: 'Próximamente',
      summary: 'Muy pronto compartiremos noticias y novedades de la comunidad estudiantil.',
    },
  ],

  // [PLACEHOLDER]
  note: 'Contenido de ejemplo. Se conectará al sistema de comunicados institucional.',
};
