import type { NewsItem } from 'src/content/noticias';

/**
 * Tarjeta de noticia del sitio publico. Emergio por repeticion (varias noticias
 * con la misma estructura). Consume un `NewsItem`; es agnostica a la fuente de
 * datos: sirve igual con el arreglo local temporal o con la respuesta del
 * endpoint publico futuro, sin cambios en el componente.
 */
const NewsCard = ({ item }: { item: NewsItem }) => (
  <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
    <div className="flex items-center gap-3 text-xs">
      <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium uppercase tracking-wide text-primary">
        {item.tag}
      </span>
      {item.date ? (
        <time dateTime={item.date} className="text-slate-500">
          {new Date(item.date).toLocaleDateString('es-CR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </time>
      ) : null}
    </div>
    <h3 className="mt-4 text-lg font-semibold text-dark">{item.title}</h3>
    <p className="mt-2 text-pretty text-slate-600">{item.summary}</p>
  </article>
);

export default NewsCard;
