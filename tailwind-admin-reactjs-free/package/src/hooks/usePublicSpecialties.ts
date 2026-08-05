import { usePublicCollection } from './usePublicCollection';

/** Item crudo de GET /api/public/v1/specialties. */
type PublicSpecialtyApiItem = {
  id: string;
  name: string;
  level: string;
  description: string;
  salida_laboral: string | null;
  slug: string;
  image: unknown | null;
};

/** Forma que consume la tarjeta de Especialidades (misma UI del MVP). */
export type PublicSpecialty = {
  id: string;
  name: string;
  level: string;
  description: string;
  icon: string;
};

// Icono por defecto: el modelo no almacena icono; se usa uno fijo para conservar
// el badge de la tarjeta sin cambiar el diseño.
const DEFAULT_ICON = 'solar:medal-ribbons-star-linear';

const adaptSpecialty = (s: PublicSpecialtyApiItem): PublicSpecialty => ({
  id: s.id,
  name: s.name,
  level: s.level,
  description: s.description,
  icon: DEFAULT_ICON,
});

export type PublicSpecialtiesState = {
  specialties: PublicSpecialty[];
  loading: boolean;
  error: boolean;
};

/** Especialidades publicas adaptadas a la forma que consume la tarjeta. */
export function usePublicSpecialties(limit = 6): PublicSpecialtiesState {
  const { items, loading, error } = usePublicCollection<PublicSpecialtyApiItem, PublicSpecialty>(
    '/specialties',
    adaptSpecialty,
    limit,
  );
  return { specialties: items, loading, error };
}
