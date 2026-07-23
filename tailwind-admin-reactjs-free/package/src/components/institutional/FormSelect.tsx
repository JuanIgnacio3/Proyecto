import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from 'src/lib/utils';

// Misma apariencia que el primitive Input (variant default), para <select> nativo.
const selectClass =
  'flex h-10 w-full rounded-lg border border-ld bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-50';

/**
 * <select> nativo estilizado como Input. Reemplaza la constante `inputClass`
 * duplicada en las vistas. Conserva accesibilidad nativa (teclado/foco).
 */
const FormSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(selectClass, className)} {...props}>
      {children}
    </select>
  ),
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
