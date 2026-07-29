// Contenido estatico de la seccion "Contacto".
// Fuente: docs/CONTENT_GUIDE.md e investigacion de fuentes oficiales.
//
// Trazabilidad:
//  - [CONFIRMADO] telefono, correo, sitio web y Facebook oficiales.
//  - [PROVISIONAL] direccion detallada y horario (no verificados oficialmente):
//    se marcan como pendientes; no se inventan datos.

export type ContactChannel = {
  icon: string;
  label: string;
  value: string;
  href?: string;
  /** true = dato aun no confirmado oficialmente. */
  pending?: boolean;
};

export type ContactoContent = {
  kicker: string;
  title: string;
  lead: string;
  channels: ContactChannel[];
  /** Embed y enlace de Google Maps (busqueda por nombre; sin API key). */
  mapEmbedSrc: string;
  mapsHref: string;
};

export const contacto: ContactoContent = {
  kicker: 'Contacto',

  // [EDITORIAL/PROVISIONAL]
  title: 'Estamos para ayudarte',

  // [EDITORIAL/PROVISIONAL]
  lead: 'Comunicate con el CTP San Pedro de Barva por los medios oficiales.',

  channels: [
    {
      // [CONFIRMADO] distrito/canton/provincia. Referencia detallada [PROVISIONAL].
      icon: 'solar:map-point-linear',
      label: 'Ubicación',
      value: 'San Pedro de Barva, Heredia, Costa Rica',
      href: 'https://www.google.com/maps/search/?api=1&query=Colegio+Tecnico+Profesional+San+Pedro+de+Barva+Barva+Heredia',
    },
    {
      // [CONFIRMADO]
      icon: 'solar:phone-linear',
      label: 'Teléfono',
      value: '2238-5053',
      href: 'tel:+50622385053',
    },
    {
      // [CONFIRMADO]
      icon: 'solar:letter-linear',
      label: 'Correo',
      value: 'ctp.sanpedrodebarva@mep.go.cr',
      href: 'mailto:ctp.sanpedrodebarva@mep.go.cr',
    },
    {
      // [CONFIRMADO]
      icon: 'solar:global-linear',
      label: 'Sitio web',
      value: 'ctpsanpedrobarva.com',
      href: 'https://www.ctpsanpedrobarva.com/',
    },
    {
      // [CONFIRMADO]
      icon: 'mdi:facebook',
      label: 'Facebook',
      value: 'CTP San Pedro de Barva',
      href: 'https://www.facebook.com/CTPSPB/',
    },
    {
      // [PROVISIONAL] horario no confirmado oficialmente.
      icon: 'solar:clock-circle-linear',
      label: 'Horario',
      value: 'Por confirmar',
      pending: true,
    },
  ],

  mapEmbedSrc:
    'https://www.google.com/maps?q=Colegio%20Tecnico%20Profesional%20San%20Pedro%20de%20Barva%2C%20Barva%2C%20Heredia&output=embed',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=Colegio+Tecnico+Profesional+San+Pedro+de+Barva+Barva+Heredia',
};
