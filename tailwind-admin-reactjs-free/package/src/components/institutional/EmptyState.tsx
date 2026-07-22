import { cn } from 'src/lib/utils';

type EmptyStateProps = {
  message: string;
  className?: string;
};

/** Estado vacio uniforme para listados sin registros. */
const EmptyState = ({ message, className }: EmptyStateProps) => (
  <div className={cn('px-6 py-10 text-center text-muted-foreground', className)}>{message}</div>
);

export default EmptyState;
