import { Children, isValidElement, type ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import { cn } from 'src/lib/utils';

// Radix no permite items con value "": usamos un centinela y lo mapeamos a "".
const EMPTY = '__empty__';

type FormSelectProps = {
  value: string | number;
  onChange: (e: { target: { value: string } }) => void;
  children: ReactNode;
  id?: string;
  className?: string;
  disabled?: boolean;
  /** Compatibilidad con la API anterior; la validacion real la hace el backend. */
  required?: boolean;
  placeholder?: string;
};

type Opt = { value: string; label: ReactNode; disabled?: boolean };

/** Extrae opciones de hijos <option> (soporta .map y condicionales). */
function extractOptions(children: ReactNode): Opt[] {
  const opts: Opt[] = [];
  Children.toArray(children).forEach((child) => {
    if (!isValidElement(child) || child.type !== 'option') return;
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
    };
    const raw = props.value == null ? '' : String(props.value);
    opts.push({ value: raw === '' ? EMPTY : raw, label: props.children, disabled: props.disabled });
  });
  return opts;
}

/**
 * Desplegable institucional: mismo look-and-feel y tipografia que el resto del
 * panel (las opciones se renderizan como DOM, no con el estilo nativo del SO).
 * Mantiene la API anterior (hijos <option> + onChange con e.target.value) para
 * poder sustituir a los <select> nativos sin reescribir cada llamada.
 */
const FormSelect = ({
  value,
  onChange,
  children,
  id,
  className,
  disabled,
  placeholder,
}: FormSelectProps) => {
  const options = extractOptions(children);
  const current = value == null || value === '' ? EMPTY : String(value);

  return (
    <Select
      value={current}
      onValueChange={(v) => onChange({ target: { value: v === EMPTY ? '' : v } })}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn(
          'h-10 w-full rounded-lg border border-ld bg-transparent px-3 text-sm text-ld shadow-none data-[state=open]:border-primary focus-visible:border-primary',
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border border-ld">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FormSelect;
