// Enlaces de navegacion del sitio publico (anclas a las secciones del Home).
// Reutilizado por el Header (nav de escritorio y menu movil) y por el Footer
// (enlaces rapidos). Fuente unica para no duplicar la lista.

export type NavLink = { label: string; href: string };

export const sectionLinks: NavLink[] = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Historia', href: '#historia' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Vida estudiantil', href: '#vida-estudiantil' },
  { label: 'Noticias', href: '#noticias' },
  { label: 'Admisión', href: '#admision' },
  { label: 'Contacto', href: '#contacto' },
];
