# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto adhiere a [Versionado Semántico](https://semver.org/lang/es/).

## [1.0.0] — 2026-08-03

Primera versión estable. Sistema institucional funcionalmente completo y auditado
de extremo a extremo (sitio público, panel administrativo por rol y API pública).

### Añadido
- **Sitio público** institucional: Hero, Historia e Identidad, Especialidades,
  Vida Estudiantil, Noticias, Calendario, Admisión y Contacto, con SEO
  (meta/OG/Twitter/JSON-LD), diseño responsive y estados vacíos.
- **Panel administrativo** con RBAC (Administrador, Profesor, Administrativo,
  Encargado, Estudiante): Estudiantes, Profesores, Administrativos, Encargados,
  Materias, Grupos, Subgrupos, Asistencia, Calificaciones, Reportes, Matrícula,
  Comunicados, Calendario y Especialidades. Dashboard con estadísticas en vivo.
- **API pública** de solo lectura (`/api/public/v1/{news,calendar,specialties}`)
  con serializadores en *whitelist*, paginación, filtros y envoltorio de error
  uniforme. Contrato en `docs/API_PUBLICA.md`.
- **Autenticación y autorización**: JWT (HS256) + bcrypt; `require_roles` como
  autoridad de servidor; guardas de ruta en el frontend.
- **Publicación de contenido** opt-in (`es_publico`) desde el panel hacia el sitio.
- **Infraestructura**: `docker-compose.yml` (desarrollo) y
  `docker-compose.prod.yml` (producción: Nginx + backend con workers no-root +
  PostgreSQL en red interna), con `Dockerfile.prod` multi-stage.
- **Documentación**: README con diagramas (C4, publicación, auth, infraestructura,
  ERD); `docs/` con arquitectura, contrato de API, dominio (`DIAGRAMAS.md`),
  guía de contenido y despliegue (`DEPLOYMENT.md`).

### Seguridad
- `SECRET_KEY` obligatoria y validada (la aplicación no arranca con una clave
  insegura); CORS configurado por variables de entorno (sin `localhost`
  incrustado); rate limiting por IP en login y API pública.
- IDOR cerrado en Reportes (`_ids_permitidos`).
- Nginx de producción con CSP y cabeceras de seguridad
  (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- Logging estructurado; credenciales del seed configurables por entorno.

### Corregido (endurecimiento y cierre)
- Eliminadas todas las superficies de plantilla accesibles: dashboard, login
  (sin login social ni registro público), y la ruta/pantalla maqueta de
  "Configuración".
- Menú de usuario real con **cierre de sesión** (antes inexistente) y usuario
  autenticado real en la cabecera.
- Raíz institucional: un visitante sin sesión aterriza en el sitio público.
- Backend: corregido un N+1 en el listado de comunicados (`joinedload`) y añadida
  una red de seguridad `409` al eliminar grupos con registros asociados.
- Consola limpia: eliminados los `console.log` de depuración de la dependencia
  `tailwind-sidebar` mediante `patch-package`.

### Limpieza
- Eliminado el código muerto de la plantilla base (vistas, componentes,
  contextos, datos mock, hojas de estilo e imágenes sin uso): `src/assets`
  reducido de 4.3 MB a 1.5 MB.

### Pendiente (externo, no bloquea la versión)
- Contenido e imágenes reales del colegio.
- Dominio oficial (canonical/OG/sitemap) y certificados TLS.
- Pruebas automatizadas y CI (deuda técnica conocida, documentada).

[1.0.0]: #100--2026-08-03
