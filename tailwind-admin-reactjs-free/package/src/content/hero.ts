// Contenido estatico temporal del Hero. Cuando exista un CMS solo cambia la
// fuente de estos datos; los componentes no deben modificarse.

export type HeroCta = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
};

export type HeroContent = {
  /** Kicker breve sobre el titular (descriptor institucional). */
  eyebrow: string;
  /** Anclaje geografico: comunidad a la que pertenece la institucion. */
  location: string;
  title: string;
  subtitle: string;
  ctas: HeroCta[];
  /**
   * Ruta a la fotografia institucional de fondo del Hero. Es el UNICO punto que
   * debe cambiar cuando exista una imagen real (o llegue el CMS): al asignar un
   * valor, el componente Hero la muestra como capa de fondo con su capa de
   * legibilidad, sin modificar el codigo del componente.
   *
   * Especificacion recomendada de la imagen:
   *  - Orientacion: horizontal (apaisada).
   *  - Proporcion: 16:9 (recorte seguro tambien a 21:9 en desktop ancho).
   *  - Resolucion minima: 2400 x 1350 px (ideal 3840 x 2160 / 4K); < 400 KB en
   *    WebP/AVIF optimizado para no penalizar el LCP.
   *  - Iluminacion: luz natural, suave, sin sobreexposicion ni flash directo.
   *  - Composicion: sujeto desplazado a la DERECHA; la mitad IZQUIERDA debe ser
   *    la zona segura para el texto (cielo, pared, taller desenfocado, etc.).
   *  - Zona segura de texto: ~45% izquierdo relativamente uniforme y oscurecible
   *    (la capa navy del Hero refuerza el contraste, pero conviene no tener
   *    puntos muy claros en esa franja).
   *  - Estilo: documental/candido y real (NO stock, NO poses de catalogo).
   *  - Elementos recomendados (en orden de prioridad): estudiantes en taller o
   *    laboratorio tecnico; especialidades en accion; fachada del colegio con
   *    contexto del entorno de Barva/Heredia. Evitar rostros identificables en
   *    primer plano sin autorizacion.
   */
  backgroundImage?: string;
};

export const hero: HeroContent = {
  eyebrow: 'Colegio Técnico Profesional',
  location: 'San Pedro de Barva · Heredia · Costa Rica',
  title: 'Educación técnica que impulsa el futuro del cantón',
  subtitle:
    'Una institución moderna, cercana y comprometida con la comunidad. Formamos personas con criterio, habilidades técnicas y valores.',
  // CTA principal orientado al visitante externo (futuros estudiantes, familias,
  // comunidad): invita a descubrir la institucion. El acceso al portal es una
  // accion secundaria disponible en el Header y el Footer. El destino '#historia'
  // se activa cuando existe esa seccion.
  ctas: [{ label: 'Conocé el colegio', href: '#historia', variant: 'primary' }],
};
