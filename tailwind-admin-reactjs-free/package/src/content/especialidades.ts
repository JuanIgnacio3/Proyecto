// Contenido editorial de la seccion "Especialidades".
// Las ESPECIALIDADES provienen del backend publico (GET /api/public/v1/specialties,
// via el hook usePublicSpecialties). Aqui solo vive el texto editorial: el
// encabezado de la seccion y los mensajes de estado.

export type EspecialidadesContent = {
  kicker: string;
  title: string;
  lead: string;
  /** Mensaje institucional cuando el backend no devuelve especialidades. */
  emptyMessage: string;
  /** Mensaje discreto si la carga falla. */
  errorMessage: string;
};

export const especialidades: EspecialidadesContent = {
  kicker: 'Especialidades técnicas',

  // [EDITORIAL/PROVISIONAL]
  title: 'Especialidades que forman para el mundo real',

  // [EDITORIAL/PROVISIONAL]
  lead: 'Formación técnica orientada a la práctica y al empleo, con metodología de aprender haciendo y modelo dual junto al sector productivo.',

  emptyMessage: 'Pronto publicaremos nuestra oferta de especialidades técnicas.',
  errorMessage: 'No fue posible cargar las especialidades en este momento.',
};
