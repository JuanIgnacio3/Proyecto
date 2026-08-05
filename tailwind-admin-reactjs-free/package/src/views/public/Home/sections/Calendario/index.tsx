import PublicCardSection from 'src/components/public/PublicCardSection';
import { calendario } from 'src/content/calendario';
import { usePublicCalendar } from 'src/hooks/usePublicCalendar';

/**
 * Seccion Calendario. Adaptacion minima del patron comun (PublicCardSection):
 * solo aporta id, fondo, textos y datos. Los eventos provienen de
 * GET /api/public/v1/calendar; reutiliza NewsCard, misma UI que Noticias.
 */
const Calendario = () => {
  const { events, loading, error } = usePublicCalendar(3);

  return (
    <PublicCardSection
      id="calendario"
      bg="bg-slate-50"
      kicker={calendario.kicker}
      title={calendario.title}
      lead={calendario.lead}
      items={events}
      loading={loading}
      error={error}
      emptyMessage={calendario.emptyMessage}
      errorMessage={calendario.errorMessage}
    />
  );
};

export default Calendario;
