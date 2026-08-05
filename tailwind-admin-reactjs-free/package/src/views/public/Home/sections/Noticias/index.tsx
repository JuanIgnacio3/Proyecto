import PublicCardSection from 'src/components/public/PublicCardSection';
import { noticias } from 'src/content/noticias';
import { usePublicNews } from 'src/hooks/usePublicNews';

/**
 * Seccion Noticias. Adaptacion minima del patron comun (PublicCardSection): solo
 * aporta id, fondo, textos editoriales y los datos del hook publico. Las tarjetas
 * provienen de GET /api/public/v1/news; la UI es la del MVP.
 */
const Noticias = () => {
  const { news, loading, error } = usePublicNews(3);

  return (
    <PublicCardSection
      id="noticias"
      bg="bg-white"
      kicker={noticias.kicker}
      title={noticias.title}
      lead={noticias.lead}
      items={news}
      loading={loading}
      error={error}
      emptyMessage={noticias.emptyMessage}
      errorMessage={noticias.errorMessage}
    />
  );
};

export default Noticias;
