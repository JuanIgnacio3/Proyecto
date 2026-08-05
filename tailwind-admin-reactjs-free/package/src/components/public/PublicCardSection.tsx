import type { NewsItem } from 'src/content/noticias';
import Container from './Container';
import SectionHeader from './SectionHeader';
import NewsCard from './NewsCard';

const GRID = 'mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3';

type PublicCardSectionProps = {
  id: string;
  /** Clase de fondo fija de la seccion (p. ej. 'bg-white' | 'bg-slate-50'). */
  bg: string;
  kicker: string;
  title: string;
  lead: string;
  items: NewsItem[];
  loading: boolean;
  error: boolean;
  emptyMessage: string;
  errorMessage: string;
};

/**
 * Seccion publica de tarjetas (Noticias, Calendario, ...). Encapsula el patron
 * comun: SectionHeader + grid + skeleton + estados (loading/empty/error/success)
 * renderizando NewsCard. Cada seccion concreta solo aporta id, fondo, textos y
 * datos; asi no se duplica la UI ni la logica de estados.
 */
const PublicCardSection = ({
  id,
  bg,
  kicker,
  title,
  lead,
  items,
  loading,
  error,
  emptyMessage,
  errorMessage,
}: PublicCardSectionProps) => (
  <section id={id} className={`scroll-mt-20 ${bg} text-dark`}>
    <Container className="py-24 sm:py-32">
      <SectionHeader kicker={kicker} title={title} lead={lead} className="max-w-2xl" />

      {loading ? (
        <div className={GRID} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-5 w-24 animate-pulse rounded bg-slate-100" />
              <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="mt-16 text-slate-500">{errorMessage}</p>
      ) : items.length === 0 ? (
        <p className="mt-16 text-slate-600">{emptyMessage}</p>
      ) : (
        <div className={GRID}>
          {items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </Container>
  </section>
);

export default PublicCardSection;
