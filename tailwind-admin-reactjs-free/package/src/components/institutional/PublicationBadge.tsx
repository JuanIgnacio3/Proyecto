import { cn } from 'src/lib/utils';

/**
 * Badge de estado de publicacion (Publico/Privado). Mismo diseno en todas las
 * vistas; `className` permite ajustes de tamano puntuales (p. ej. el calendario
 * usa un padding menor para alinearse con el badge de tipo).
 */
const PublicationBadge = ({ isPublic, className }: { isPublic: boolean; className?: string }) => (
  <span
    className={cn(
      'rounded-full px-3 py-1 text-xs font-medium',
      isPublic ? 'bg-lightsuccess text-success' : 'bg-muted text-muted-foreground',
      className,
    )}
  >
    {isPublic ? 'Público' : 'Privado'}
  </span>
);

export default PublicationBadge;
