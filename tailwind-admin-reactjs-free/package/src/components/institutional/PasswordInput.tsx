import { Icon } from '@iconify/react';
import { forwardRef, useState } from 'react';
import { Input, type InputProps } from 'src/components/ui/input';
import { cn } from 'src/lib/utils';

/**
 * Campo de contrasena con boton para mostrar/ocultar lo escrito (el "ojito").
 * Reemplaza a <Input type="password" /> conservando toda su API.
 */
const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={cn('pr-10', className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={props.disabled}
          tabIndex={-1}
          aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          title={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-ld disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon icon={visible ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={18} height={18} />
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
