import { cn } from 'src/lib/utils';

/**
 * Kicker de seccion del sitio publico: filete dorado + etiqueta en mayusculas.
 * Patron heredado del Hero; emergio por repeticion (Hero, Historia, Especialidades)
 * y se extrae aqui como componente publico.
 *
 * - Fondo claro (default): texto navy.
 * - Sobre navy (`light`): texto blanco.
 */
const Kicker = ({
  children,
  light = false,
  className,
}: {
  children: string;
  light?: boolean;
  className?: string;
}) => (
  <div className={cn('flex items-center gap-3', className)}>
    <span className="h-px w-8 bg-secondary" />
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-[0.25em]',
        light ? 'text-white/80' : 'text-primary',
      )}
    >
      {children}
    </p>
  </div>
);

export default Kicker;
