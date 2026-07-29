import { Icon } from '@iconify/react';
import Container from 'src/components/public/Container';
import SectionHeader from 'src/components/public/SectionHeader';
import NewsCard from 'src/components/public/NewsCard';
import { noticias } from 'src/content/noticias';

/**
 * Seccion Noticias (MVP estatico). Superficie clara FIJA, tras la banda navy de
 * Vida estudiantil. Hoy consume un arreglo local temporal; manana consumira el
 * endpoint publico de comunicados cambiando SOLO la fuente de datos (NewsCard y
 * esta seccion no se modifican).
 */
const Noticias = () => (
  <section id="noticias" className="scroll-mt-20 bg-white text-dark">
    <Container className="py-24 sm:py-32">
      <SectionHeader
        kicker={noticias.kicker}
        title={noticias.title}
        lead={noticias.lead}
        className="max-w-2xl"
      />

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {noticias.items.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {noticias.note ? (
        <p className="mt-8 flex items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-5 py-4 text-sm text-slate-500">
          <Icon icon="solar:info-circle-linear" aria-hidden="true" className="size-4 shrink-0" />
          {noticias.note}
        </p>
      ) : null}
    </Container>
  </section>
);

export default Noticias;
