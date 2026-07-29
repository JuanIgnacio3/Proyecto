// Contenido estatico de la seccion "Especialidades tecnicas".
// Fuente: docs/CONTENT_GUIDE.md. Solo se listan especialidades VERIFICADAS.
//
// Trazabilidad:
//  - [CONFIRMADO] verificado por fuente oficial o prensa nacional.
//  - [EDITORIAL/PROVISIONAL] redaccion propia fundamentada en datos confirmados.
//
// IMPORTANTE: el listado oficial y completo de especialidades NO esta verificado
// (CONTENT_GUIDE seccion 3). Solo "Desarrollo Web" esta confirmada. El resto de la
// oferta permanece marcada como provisional (`note`) hasta que el colegio la confirme.

export type Especialidad = {
  name: string;
  level: string;
  description: string;
  icon: string;
};

export type EspecialidadesContent = {
  kicker: string;
  title: string;
  lead: string;
  items: Especialidad[];
  /** Aviso provisional sobre la oferta completa aun no verificada. */
  note?: string;
};

export const especialidades: EspecialidadesContent = {
  kicker: 'Especialidades técnicas',

  // [EDITORIAL/PROVISIONAL] fundamentado en: formacion tecnica + practica + dual (CONFIRMADO).
  title: 'Especialidades que forman para el mundo real',

  // [EDITORIAL/PROVISIONAL] fundamentado en: metodologia practica y modelo dual (CONFIRMADO).
  lead: 'Formación técnica orientada a la práctica y al empleo, con metodología de aprender haciendo y modelo dual junto al sector productivo.',

  items: [
    {
      // [CONFIRMADO] Desarrollo Web (MEP, 2021) + educacion dual con Accenture (2022).
      name: 'Desarrollo Web',
      level: 'Técnico profesional · modalidad dual',
      description:
        'Creación y programación de sitios y aplicaciones web. Impartida en modalidad dual, en alianza con el sector productivo.',
      icon: 'solar:code-linear',
    },
  ],

  // [PROVISIONAL] hasta confirmar el listado oficial con la institucion.
  note: 'La oferta completa de especialidades está en confirmación con la institución.',
};
