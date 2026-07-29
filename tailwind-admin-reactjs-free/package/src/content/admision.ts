// Contenido estatico de la seccion "Admision / Matricula".
// Fuente: docs/CONTENT_GUIDE.md e investigacion del sitio oficial de admision.
//
// Trazabilidad:
//  - [CONFIRMADO] estructura de 5 pasos y enlaces del proceso oficial de admision
//    (sitio oficial ctpsanpedrobarva.com).
//  - [EDITORIAL/PROVISIONAL] redaccion propia (titulo, lead, aviso).
//
// No se incluyen requisitos ni fechas especificas: viven en el sitio oficial y no
// se replican aqui para no arriesgar datos desactualizados. El CTA lleva al proceso
// oficial, unica fuente de verdad de requisitos, formularios y fechas.

export type AdmisionStep = { title: string };
export type AdmisionCta = { label: string; href: string };

export type AdmisionContent = {
  kicker: string;
  title: string;
  lead: string;
  steps: AdmisionStep[];
  primaryCta: AdmisionCta;
  note?: string;
};

export const admision: AdmisionContent = {
  kicker: 'Admisión',

  // [EDITORIAL/PROVISIONAL]
  title: 'Formá parte del CTP San Pedro de Barva',

  // [EDITORIAL/PROVISIONAL]
  lead: 'El proceso de admisión a séptimo año se realiza en el sitio oficial del colegio. Seguí estos pasos.',

  // [CONFIRMADO] los 5 pasos del proceso oficial de admision.
  steps: [
    { title: 'Descargá la boleta de admisión' },
    { title: 'Completá el formulario de solicitud' },
    { title: 'Revisá la estructura de la prueba de habilidades' },
    { title: 'Leé el procedimiento de admisión' },
    { title: 'Consultá las fechas importantes' },
  ],

  // [CONFIRMADO] sitio oficial de admision.
  primaryCta: {
    label: 'Ver el proceso oficial',
    href: 'https://www.ctpsanpedrobarva.com/',
  },

  // [EDITORIAL/PROVISIONAL] puntero al sitio oficial (no dato inventado).
  note: 'Los requisitos, formularios y fechas se publican en el sitio oficial de admisión.',
};
