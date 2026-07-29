// Contenido estatico de la seccion "Historia e Identidad".
// Fuente: docs/CONTENT_GUIDE.md. Cuando exista un CMS solo cambia esta fuente;
// el componente no se modifica.
//
// Trazabilidad del contenido:
//  - [CONFIRMADO] dato verificado (fuente oficial o prensa nacional).
//  - [EDITORIAL/PROVISIONAL] redaccion propia fundamentada en datos confirmados;
//    debe validarse con el colegio antes de considerarse definitiva.

export type HistoriaPilar = { icon: string; title: string; body: string };
export type HistoriaFact = { label: string; value: string };
export type HistoriaStat = { value: string; label: string };

export type HistoriaContent = {
  kicker: string;
  title: string;
  lead: string;
  /** Slot opcional de fotografia "aprender haciendo" (futura / CMS). */
  image?: string;
  pillars: HistoriaPilar[];
  facts: HistoriaFact[];
  stats: HistoriaStat[];
  manifesto: string;
};

export const historia: HistoriaContent = {
  kicker: 'Historia e identidad',

  // [EDITORIAL/PROVISIONAL] fundamentado en: tecnico + San Pedro de Barva (CONFIRMADO).
  title: 'Formación técnica con raíces en Barva',

  // [EDITORIAL/PROVISIONAL] fundamentado en: fundacion 2011, San Pedro de Barva,
  // especialidades tecnicas y metodologia practica/dual (CONFIRMADO).
  lead: 'Desde 2011 formamos a estudiantes de San Pedro de Barva en especialidades técnicas, combinando el aula con la práctica real para que aprendan haciendo.',

  pillars: [
    {
      // [CONFIRMADO] metodologia teorico-practica / educacion dual.
      icon: 'solar:ruler-pen-linear',
      title: 'Aprender haciendo',
      body: 'La formación ocurre en talleres y laboratorios: los estudiantes aplican lo que aprenden en proyectos y práctica real.',
    },
    {
      // [CONFIRMADO] pionero en educacion dual; alianza con Accenture (2022).
      icon: 'solar:buildings-2-linear',
      title: 'Educación dual',
      body: 'Pioneros en el modelo dual: se aprende en el aula y en la empresa, en alianza con el sector productivo.',
    },
    {
      // [CONFIRMADO] top-20 nacional en admision UCR 2023-2024 (La Nacion).
      icon: 'solar:medal-ribbons-star-linear',
      title: 'Excelencia comprobada',
      body: 'Entre los 20 colegios con mejor promedio en el examen de admisión de la UCR (2023-2024).',
    },
  ],

  // [CONFIRMADO] ficha institucional (CONTENT_GUIDE seccion 4).
  facts: [
    { label: 'Nombre oficial', value: 'Colegio Técnico Profesional San Pedro de Barva' },
    { label: 'Ubicación', value: 'San Pedro de Barva, Heredia' },
    { label: 'Modalidad', value: 'Técnico profesional · diurno y nocturno' },
    { label: 'Dependencia', value: 'MEP · Dirección Regional de Heredia' },
    { label: 'Fundación', value: '2011' },
  ],

  // [CONFIRMADO] cifras verificables (CONTENT_GUIDE seccion 5).
  stats: [
    { value: '2011', label: 'Año de fundación' },
    { value: '704', label: 'Estudiantes (2024)' },
    { value: 'Top 20', label: 'Nacional en admisión UCR' },
  ],

  // [EDITORIAL/PROVISIONAL] declaracion de compromiso (no es un dato factico);
  // validar la voz institucional con el colegio.
  manifesto:
    'Creemos en una educación técnica que abre futuro. Nos comprometemos con cada estudiante de San Pedro de Barva: formarlos con criterio, prepararlos para el trabajo y la vida, y crecer junto a nuestra comunidad.',
};
