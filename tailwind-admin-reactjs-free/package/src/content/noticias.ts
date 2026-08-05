// Contenido editorial de la seccion "Noticias".
// Los ITEMS de noticias provienen del backend publico (GET /api/public/v1/news,
// via el hook usePublicNews). Aqui solo vive el texto editorial de la seccion:
// el encabezado y los mensajes de estado. `NewsItem` es la forma que consume
// NewsCard (y a la que el hook adapta la respuesta del backend).

export type NewsItem = {
  id: string;
  tag: string;
  title: string;
  summary: string;
  /** Fecha ISO (opcional). */
  date?: string;
};

export type NoticiasContent = {
  kicker: string;
  title: string;
  lead: string;
  /** Mensaje institucional cuando el backend no devuelve noticias. */
  emptyMessage: string;
  /** Mensaje discreto si la carga falla. */
  errorMessage: string;
};

export const noticias: NoticiasContent = {
  kicker: 'Noticias',

  // [EDITORIAL/PROVISIONAL]
  title: 'Lo que sucede en el colegio',

  // [EDITORIAL/PROVISIONAL]
  lead: 'Comunicados oficiales, actividades y novedades de la comunidad estudiantil.',

  emptyMessage: 'Próximamente compartiremos noticias y comunicados institucionales.',
  errorMessage: 'No fue posible cargar las noticias en este momento.',
};
