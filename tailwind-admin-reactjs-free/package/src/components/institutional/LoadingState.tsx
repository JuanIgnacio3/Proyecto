import { cn } from 'src/lib/utils';

type LoadingStateProps = {
  message?: string;
  className?: string;
};

/** Estado de carga uniforme para listados y secciones. */
const LoadingState = ({ message = 'Cargando...', className }: LoadingStateProps) => (
  <div className={cn('px-6 py-10 text-center text-muted-foreground', className)}>{message}</div>
);

export default LoadingState;
