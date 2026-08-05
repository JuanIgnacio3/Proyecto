import type { NewsItem } from 'src/content/noticias';
import { usePublicCollection } from './usePublicCollection';

/** Item crudo de GET /api/public/v1/calendar (superset; trae start/end/slug...). */
type PublicCalendarApiItem = {
  id: string;
  title: string;
  summary: string | null;
  start: string;
  end: string | null;
  all_day: boolean;
  location: string | null;
  tag: string | null;
  slug: string;
  image: unknown | null;
};

/** Adaptador estable (a nivel de modulo). */
const adaptEvent = (e: PublicCalendarApiItem): NewsItem => ({
  id: e.id,
  tag: e.tag ?? 'Actividad',
  title: e.title,
  summary: e.summary ?? '',
  // `start` es date-only (YYYY-MM-DD); se interpreta como medianoche LOCAL para
  // evitar el desfase de un dia en zonas UTC-negativas.
  date: `${e.start}T00:00:00`,
});

export type PublicCalendarState = {
  events: NewsItem[];
  loading: boolean;
  error: boolean;
};

/** Eventos publicos adaptados al tipo `NewsItem` que consume NewsCard. */
export function usePublicCalendar(limit = 3): PublicCalendarState {
  const { items, loading, error } = usePublicCollection<PublicCalendarApiItem, NewsItem>(
    '/calendar',
    adaptEvent,
    limit,
  );
  return { events: items, loading, error };
}
