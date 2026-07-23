import type { ReactNode } from 'react';
import { Label } from 'src/components/ui/label';
import { cn } from 'src/lib/utils';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Envoltura Label + control. Asocia la etiqueta (htmlFor) al control (que debe
 * llevar el mismo `id`) con el espaciado estandar. El asterisco es solo indicador
 * visual: la validacion sigue en el control (`required`).
 */
const FormField = ({ label, htmlFor, required, className, children }: FormFieldProps) => (
  <div className={className}>
    <Label htmlFor={htmlFor}>
      {label}
      {required && <span className="text-error"> *</span>}
    </Label>
    <div className={cn('mt-1')}>{children}</div>
  </div>
);

export default FormField;
