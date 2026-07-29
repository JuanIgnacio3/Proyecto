import { cn } from 'src/lib/utils';
import Kicker from './Kicker';

/**
 * Encabezado de seccion del sitio publico: Kicker + titulo (H2) + lead. Emergio
 * por repeticion (mismo patron en Historia, Especialidades, Vida estudiantil,
 * Noticias, Admision y Contacto) y centraliza el estilo del H2.
 *
 * - `tone`: 'light' (sobre fondo claro, texto navy) o 'dark' (sobre navy, texto
 *   blanco). Ajusta el Kicker, el H2 y el lead.
 * - `className`: ancho/posicion del contenedor (p. ej. 'max-w-2xl').
 * - `leadClassName`: ancho del lead cuando la seccion lo restringe (p. ej. 'max-w-xl').
 *
 * No cambia la apariencia: replica exactamente las clases que ya usaba cada seccion.
 */
type SectionHeaderProps = {
  kicker: string;
  title: string;
  lead: string;
  tone?: 'light' | 'dark';
  className?: string;
  leadClassName?: string;
};

const SectionHeader = ({
  kicker,
  title,
  lead,
  tone = 'light',
  className,
  leadClassName,
}: SectionHeaderProps) => {
  const dark = tone === 'dark';
  return (
    <div className={className}>
      <Kicker light={dark}>{kicker}</Kicker>
      <h2
        className={cn(
          "mt-6 text-balance font-['Bricolage_Grotesque'] text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl",
          dark ? 'text-white' : 'text-dark',
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          'mt-6 text-pretty text-lg',
          dark ? 'text-white/75' : 'text-slate-600',
          leadClassName,
        )}
      >
        {lead}
      </p>
    </div>
  );
};

export default SectionHeader;
