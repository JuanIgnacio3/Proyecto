// Contenido estatico de la seccion "Vida estudiantil".
// Fuente: docs/CONTENT_GUIDE.md.
//
// Trazabilidad:
//  - [CONFIRMADO] verificado por fuente oficial o prensa nacional.
//  - [EDITORIAL/PROVISIONAL] redaccion propia fundamentada en datos confirmados;
//    validar la voz institucional con el colegio.
//
// Seccion foto-dependiente: sin fotografias reales se usa el fondo inmersivo de
// fallback (previsto por la arquitectura). El slot `image` queda listo para la
// foto real.

export type VidaFacet = { title: string; body: string };

export type VidaEstudiantilContent = {
  kicker: string;
  title: string;
  lead: string;
  facets: VidaFacet[];
  /** Slot opcional de fotografia de fondo full-bleed (futura / CMS). */
  image?: string;
};

export const vidaEstudiantil: VidaEstudiantilContent = {
  kicker: 'Vida estudiantil',

  // [EDITORIAL/PROVISIONAL] fundamentado en: comunidad en San Pedro de Barva (CONFIRMADO).
  title: 'Una comunidad donde se aprende y se pertenece',

  // [EDITORIAL/PROVISIONAL] fundamentado en: San Pedro de Barva, aprender haciendo,
  // logros academicos (CONFIRMADO).
  lead: 'Desde el corazón de San Pedro de Barva formamos una comunidad que aprende haciendo, crece en equipo y celebra sus logros.',

  facets: [
    {
      // [CONFIRMADO] fundacion 2011 en San Pedro de Barva.
      title: 'Raíces en Barva',
      body: 'Desde 2011 somos parte de la comunidad de San Pedro de Barva.',
    },
    {
      // [CONFIRMADO] metodologia practica + educacion dual.
      title: 'Aprender en equipo',
      body: 'En talleres, laboratorios y modelo dual, los estudiantes aprenden colaborando.',
    },
    {
      // [CONFIRMADO] top-20 nacional en admision UCR 2023-2024.
      title: 'Estudiantes que destacan',
      body: 'Entre los mejores del país en el examen de admisión universitaria.',
    },
  ],
};
