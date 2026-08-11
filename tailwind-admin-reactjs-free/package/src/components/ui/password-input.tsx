import * as React from 'react';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Input, type InputProps } from 'src/components/ui/input';
import { cn } from 'src/lib/utils';

type PasswordInputProps = Omit<InputProps, 'type'>;

/** Campo de contrasena con boton para mostrar/ocultar lo que se escribe. */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
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
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-primary focus-visible:outline-0"
          aria-label={visible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          tabIndex={-1}
        >
          <Icon icon={visible ? 'solar:eye-closed-linear' : 'solar:eye-linear'} width={18} />
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
