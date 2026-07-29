# PROJECT_STATE — Sistema Institucional (TCU)

Documento de referencia del proyecto: estado, arquitectura, convenciones, fases y
decisiones vigentes. Contiene solo información consolidada.

## 0. Estado actual (Fase 4)

- **Backend:** completo (todos los dominios: modelos, schemas, endpoints, migraciones).
- **Panel administrativo:** arquitectura validada; **Ola A finalizada** (Materias,
  Estudiantes, Encargados, Profesores, Administrativos migrados a la capa
  institucional).
- **Arquitectura del sitio público:** **completada** y aprobada — referencia oficial
  en `docs/ARQUITECTURA-SITIO-PUBLICO.md`. Contenido institucional en
  `docs/CONTENT_GUIDE.md`.
- **Fase en curso:** **Fase 4 — Construcción del sitio público** (Hero cerrado;
  Historia con diseño aprobado, pendiente de implementación).

## 1. Resumen

Sistema web institucional para un colegio (CTP San Pedro de Barva). Monorepo con
SPA (React) + API (FastAPI) + PostgreSQL, dockerizado. Autenticación JWT y control
de acceso por roles. Todos los módulos del sidebar están implementados y conectados
frontend↔backend.

## 2. Stack

- **Frontend:** React 19 · TypeScript 5 · Vite 7 · React Router 7 · Tailwind CSS 4 ·
  shadcn/Radix (primitives) · Iconify. Cliente HTTP propio (sin Axios). Sin librería
  de estado global (solo Context para auth/tema).
- **Backend:** FastAPI · SQLAlchemy 2 · Pydantic v2 · Alembic · bcrypt · PyJWT.
- **DB/DevOps:** PostgreSQL 16 · Docker Compose (db + backend).

## 3. Arquitectura y estructura

```
Proyecto/
├── backend/app/
│   ├── api/v1/endpoints/<dominio>.py   # rutas REST (auth + roles + persistencia)
│   ├── core/ (config, security JWT)
│   ├── db/ (session, base, seed)
│   ├── models/<dominio>.py             # entidades SQLAlchemy
│   ├── schemas/<dominio>.py            # contratos Pydantic
│   └── main.py                         # FastAPI + CORS, monta /api/v1
│   └── alembic/                        # migraciones
├── tailwind-admin-reactjs-free/package/src/
│   ├── components/ui/*                 # primitives shadcn/Radix
│   ├── components/institutional/*      # capa institucional (Fase 2)
│   ├── components/shared/ (CardBox, ScrollToTop)
│   ├── context/auth-context            # sesión JWT
│   ├── hooks/ (useModal)
│   ├── layouts/ (full, blank, public[prep])
│   ├── lib/ (api.ts + servicios <dominio>.ts + roles.ts)
│   ├── routes/Router.tsx
│   ├── types/<dominio>.ts
│   └── views/school/<Modulo>.tsx
├── docs/ (ARQUITECTURA-FRONTEND.md, CATALOGO-COMPONENTES.md)
└── docker-compose.yml
```

**Flujo FE:** vista → `lib/<dominio>.ts` → `lib/api.ts` (único cliente HTTP; token,
errores, verbos) → `/api/v1`. Las vistas nunca llaman `fetch` directo.
**Backend:** patrón `models + schemas + endpoints (+ migración)` por dominio.

## 4. Modelo de datos (entidades)

`Usuario`, `Rol`, `TipoDocumento`, `Estudiante`, `Profesor`, `Administrativo`,
`Encargado`, `Asignatura`, `Grupo`, `SubGrupo`, `SubGrupo_Profesor` (M2M),
`SubGrupo_Estudiante` (M2M), `Encargado_Estudiante` (M2M), `Asistencia`,
`Evaluacion`, `Nota`, `Comunicado`, `Evento`.

Relaciones clave: Estudiante/Profesor/Encargado/Administrativo → `Usuario` (1:1) →
`Rol`. Estudiante → `Grupo` (matrícula). Grupo → `Asignatura`. SubGrupo pertenece a
Grupo y tiene M2M con profesores y estudiantes. Encargado ↔ Estudiante (M2M).
Asistencia y Nota se enlazan a Estudiante; Evaluacion a Grupo.

## 5. Módulos (todos implementados: list/CRUD + verificado en navegador)

Estudiantes, Profesores, Administrativos, Encargados, Materias, Grupos, Subgrupos,
Matrícula, Asistencia, Calificaciones, Reportes, Comunicados, Calendario, Dashboard
(métricas reales), Auth (login JWT), Navegación por rol.

Notas: los módulos de personas usan alta+edición+desactivar (soft-delete vía
`usuario.activo`). Materias/Grupos/Subgrupos usan borrado real con guards de FK.
Matrícula opera sobre `estudiante.id_grupo` (sin tabla nueva). Reportes y
Comunicados filtran por rol/audiencia.

## 6. Roles y permisos

Roles: `Administrador`, `Profesor`, `Administrativo`, `Encargado`, `Estudiante`.

- **Administrador:** todo.
- **Profesor:** lee académico + toma asistencia + pone notas + ve reportes de
  cualquier estudiante.
- **Administrativo** (acceso limitado): gestiona Estudiantes, Encargados y
  Matrícula; lee Grupos; ve Reportes. No toca Profesores, académico, Configuración
  ni gestiona otros administrativos.
- **Encargado:** solo Reportes (de sus estudiantes vinculados) + Comunicados +
  Calendario.
- **Estudiante:** solo su propio Reporte + Comunicados + Calendario.

Doble control: backend (`require_roles`) + frontend (`src/lib/roles.ts`:
`canAccess`, `landingFor`, `canManagePersonas`, `canManageComunicados`,
`canManageCalendario`). El frontend es solo navegación; la seguridad real es backend.

## 7. Cuentas de prueba (solo desarrollo)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@ctpsanpedrodebarva.ed.cr | ChangeMe123! |
| Administrativo | secre.test@ctpsanpedrodebarva.ed.cr | Admin1234! |
| Profesor (varios) | ana.mora@… (y otros) | Profesor123! |
| Encargado | tutor.test@familias.ed.cr | Encargado123! |
| Estudiante | maria.gomez@… / karla.vargas@… | Estudiante123! |

Seed: `docker compose exec backend python -m app.db.seed`.

## 8. Convenciones

Fuente única: **`docs/CATALOGO-COMPONENTES.md`** (nomenclatura, estructura, exports,
props, reutilización, accesibilidad, cuándo crear vs extender). Obligatorias para
componentes nuevos. Regla base: componer los primitives `ui/*`, usar tokens de
`globals.css`, importar institucionales desde el barrel.

Metodología de trabajo (todas las fases): **diseñar → revisar → implementar pieza
pequeña → verificar (`tsc`, `lint`, funcional) → revisar**. Commits solo con
autorización explícita.

## 9. Fase 2 (en curso): consolidación de arquitectura

Objetivo: capa de componentes institucionales sobre los primitives, sin reescritura.

- **Hecho:** capa institucional completa (PageContainer, PageHeader, PageActions,
  SectionCard, CrudTable, RowActions, StatusBadge, Banner, EmptyState,
  LoadingState, FormField, FormSelect, CheckboxList, CrudFormDialog) + `useModal` +
  helper `getErrorMessage`; `PublicLayout` (prep, no enrutado). Piloto **Materias**
  migrado completo y probado.
- **En curso:** extender adopción por olas — **A** (Estudiantes, Profesores,
  Administrativos, Encargados) → **B** (Grupos, Subgrupos) → **C** (Comunicados,
  Calendario) → **D** (Matrícula, Asistencia, Calificaciones, Reportes).
- **Diferido:** `ConfirmDialog` + `useConfirm` (fase posterior); `useResource` y
  `useCrud`/`usePagination`/`useSearch`/`useFilters` (YAGNI).

## 10. Problemas conocidos / deuda técnica

- Header muestra usuario estático ("Administracion / Rol temporal"); existe
  `Profile` con logout no integrado al `Header`.
- Fix global de cierre de diálogos (Radix + tw-animate) por evento `animationend`
  que no dispara en algunos entornos; revisar si se actualiza Radix.
- Tipos de `Grupo` duplicados/cercanos en `types/estudiante.ts` y `types/grupo.ts`.
- Código heredado de plantilla no enrutado (blog/notes/tickets, `sidebaritems.ts`,
  `DataTable` demo) — documentado en `docs/ARQUITECTURA-FRONTEND.md`, no eliminado.
- Sin pruebas automatizadas ni CI. Token en `localStorage`. Docker Compose solo dev
  (frontend no incluido). Seed/`.env.example` con secretos por defecto (dev).

## 11. Próximos pasos

1. Consolidar (commit) catálogo + primer incremento funcional de Fase 2 juntos.
2. Completar piloto Materias y extender por olas.
3. Fase posterior: `ConfirmDialog`/`useConfirm`, integrar identidad real en header,
   módulo público, pruebas mínimas (auth/roles/flujos críticos).
