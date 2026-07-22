# Arquitectura Frontend

Notas de la consolidacion (Fase 2). El objetivo fue **evolucionar** la base
existente, no reescribirla: se agrego una capa de componentes institucionales
sobre los primitives que ya existian y se preparo terreno para el modulo publico.

## Capas

```
views/school/<Modulo>.tsx        Pantalla y estado de presentacion del modulo
components/institutional/*        Componentes institucionales (esta fase)
components/ui/*                   Primitives shadcn/Radix (Button, Card, Dialog...)
lib/<modulo>.ts                  Servicio HTTP del dominio
lib/api.ts                        Cliente HTTP unico (token, errores, verbos)
```

Regla: **las vistas no llaman `fetch` directamente**; usan `lib/<modulo>.ts`,
que a su vez usa `lib/api.ts`.

## Componentes institucionales (`src/components/institutional`)

Capa reutilizable **sobre** los primitives (no los reemplaza). Barrel en
`components/institutional/index.ts`.

| Componente | Uso |
|---|---|
| `PageHeader` | Cabecera de modulo: icono + titulo + descripcion + accion. Ocupa las 12 columnas. |
| `Banner` | Mensaje contextual (`tone`: error/success/info/warning). Reemplaza los bloques `bg-light* text-*`. |
| `EmptyState` | Listado sin registros. |
| `LoadingState` | Estado de carga. |
| `StatusBadge` | Pastilla de estado; `active` da Activo/Inactivo, o `tone` + `children` para categorias. |
| `CrudFormDialog` | Dialogo de formulario CRUD: envuelve `Dialog` y aporta titulo, banner de error y pie Cancelar/Guardar. |

Hook asociado: `src/hooks/useModal.ts` (`useModal<T>()`) para el patron
open/editing de las vistas CRUD.

**Modulo de referencia ya migrado:** `views/school/Materias.tsx`. Los demas
modulos pueden adoptar estos componentes de forma incremental (no es urgente
migrarlos todos a la vez).

### Como se ve una vista tras adoptar la capa

```tsx
<PageHeader icon="..." title="..." description="..." action={isAdmin && <Button .../>} />
...
{listError && <Banner tone="error" className="m-6">{listError}</Banner>}
{vacio && <EmptyState message="..." />}
...
<CrudFormDialog open={open} onOpenChange={setOpen} title={...} error={formError}
  saving={saving} onSubmit={handleSubmit} className="max-w-md">
  {/* campos del formulario */}
</CrudFormDialog>
```

## Modulo publico (preparado, no implementado)

`src/layouts/public/PublicLayout.tsx` es el layout para el futuro sitio publico
(sin autenticacion). **Aun no esta enrutado ni hay paginas publicas.** Cuando se
defina el modulo publico:

1. Envolver rutas publicas con `<PublicLayout />` **fuera** de `RequireAuth`.
2. Exponer endpoints publicos explicitos en el backend (no reutilizar los
   autenticados) con DTOs propios.
3. Revisar CORS segun el dominio final.

Comunicados y eventos son candidatos a lectura publica, pero hoy exigen JWT y
aplican reglas por audiencia; requeriran endpoints publicos especificos.

## Codigo heredado de la plantilla (candidato a retiro)

No se elimina automaticamente. Son restos de la plantilla TailwindAdmin que **no
participan** en el flujo institucional (no estan en el router activo). Retirar de
forma planificada cuando se confirme que no se reutilizaran:

- `views/apps/*` y `components/apps/*` (blog, notes, tickets) + sus contextos en
  `context/blog-context`, `context/notes-context`, `context/ticket-context` y
  `api/*` de demo.
- `layouts/full/vertical/sidebar/sidebaritems.ts` (menu original de la plantilla;
  el sidebar activo usa `schoolSidebarItems.ts`).
- `components/utilities/table/*` (incluye `DataTable` demo "Employee Data Table",
  con textos y acciones sin callbacks) y `views/utilities/*`.
- Paginas de plantilla no enrutadas al flujo institucional (p. ej. registro
  `auth2/Register`, que no tiene backend de registro).

Antes de borrar: verificar con una busqueda de imports que ningun modulo activo
los use.

## Pendientes conocidos (deuda tecnica)

- Header muestra usuario estatico ("Administracion / Rol temporal"); existe
  `Profile` con logout no integrado al `Header`.
- Tipos de `Grupo` cercanos en `types/estudiante.ts` y `types/grupo.ts`.
- Sin pruebas automatizadas ni CI.
