import { Label } from 'src/components/ui/label';

export type Visibilidad = 'todos' | 'publicos' | 'privados';

const selectClass =
  'flex h-10 w-auto border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

/**
 * Filtro de visibilidad (Todos / Publicos / Privados). Unico componente para
 * los tres modulos del panel.
 */
const VisibilityFilter = ({
  value,
  onChange,
  id = 'fvis',
}: {
  value: Visibilidad;
  onChange: (value: Visibilidad) => void;
  id?: string;
}) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={id} className="text-sm text-muted-foreground">
      Visibilidad
    </Label>
    <select
      id={id}
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value as Visibilidad)}
    >
      <option value="todos">Todos</option>
      <option value="publicos">Públicos</option>
      <option value="privados">Privados</option>
    </select>
  </div>
);

export default VisibilityFilter;
