import type { NewsItem } from 'src/content/noticias';
import { usePublicCollection } from './usePublicCollection';

/** Item crudo de GET /api/public/v1/news (superset de NewsItem: trae slug/image). */
type PublicNewsApiItem = {
  id: string;
  tag: string;
  title: string;
  summary: string;
  date: string;
  slug: string;
  image: unknown | null;
};

/** Adaptador estable (a nivel de modulo) para no re-disparar el efecto. */
const adaptNews = (n: PublicNewsApiItem): NewsItem => ({
  id: n.id,
  tag: n.tag,
  title: n.title,
  summary: n.summary,
  date: n.date,
});

export type PublicNewsState = {
  news: NewsItem[];
  loading: boolean;
  error: boolean;
};

/** Noticias publicas adaptadas al tipo `NewsItem` que consume NewsCard. */
export function usePublicNews(limit = 3): PublicNewsState {
  const { items, loading, error } = usePublicCollection<PublicNewsApiItem, NewsItem>(
    '/news',
    adaptNews,
    limit,
  );
  return { news: items, loading, error };
}
