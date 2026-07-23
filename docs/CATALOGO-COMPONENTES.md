# Catálogo de componentes institucionales

Referencia **oficial y obligatoria** de la capa `src/components/institutional/*`,
sus hooks/helpers y las convenciones de desarrollo. Toda implementación futura de
componentes debe seguir este documento.

**Leyenda de estado**

- ✅ Implementado.
- 🕒 Planificado para una fase posterior (no se implementa aún).

---

## 1. Convenciones de desarrollo (obligatorias)

### Nomenclatura

- Componentes en **PascalCase**, un componente por archivo con el mismo nombre:
  `PageHeader.tsx`.
- Hooks en **camelCase** con prefijo `use`: `useModal.ts`.
- Helpers en **camelCase**: `getErrorMessage`.
- El tipo de props se llama `<Componente>Props` (no se exporta salvo que otro
  módulo lo necesite).

### Estructura de carpetas de un componente

- Institucionales: **archivo único** en
  `src/components/institutional/<Componente>.tsx` mientras sean simples.
- Si un componente crece (subcomponentes, helpers propios, tests), se promueve a
  carpeta: `src/components/institutional/<Componente>/index.tsx`.
- Los primitives permanecen en `src/components/ui/*` y **no se modifican** salvo
  necesidad justificada.
- Hooks en `src/hooks/`; helpers de dominio transversal en `src/lib/`.

### Exports (`index.ts`)

- Cada componente se **re-exporta** desde `institutional/index.ts` (barrel), con
  export nombrado: `export { default as PageHeader } from './PageHeader';`.
- Los tipos públicos también se exportan desde el barrel
  (`export type { BadgeTone } from './StatusBadge';`).
- Los consumidores **siempre importan desde el barrel**:
  `import { PageHeader, Banner } from 'src/components/institutional';`.

### Reglas para props

- Mínimas y explícitas; no exponer detalles internos de implementación.
- `className?: string` en todo componente presentacional, combinado con `cn(...)`
  para permitir ajustes de layout desde el consumidor.
- `children` para composición cuando aplique (preferir composición a props de
  configuración cuando el contenido es libre).
- Callbacks con prefijo `on` (`onSubmit`, `onToggle`, `onOpenChange`).
- Valores por defecto sensatos (`tone = 'error'`, `submitLabel = 'Guardar'`).
- Evitar pasar objetos de dominio completos si bastan primitivos, salvo objetos
  de configuración explícitos (p. ej. `columns` de `CrudTable`).

### Reglas para reutilización

- Antes de crear, verificar si un primitive (`ui/*`) o un institucional ya
  resuelve el caso.
- **Componer** primitives; nunca reescribirlos ni duplicarlos.
- Usar **tokens** de `globals.css`; prohibido hardcodear color/espaciado/sombra
  si existe token equivalente.
- Fuente de iconos preferida en componentes nuevos: **Iconify** (`@iconify/react`).

### Cuándo crear vs. extender

- **Crear** un componente nuevo cuando un patrón se repite en **≥ 3 lugares** o
  encapsula una responsabilidad clara y estable.
- **Extender** (nueva prop/variante) cuando el caso es una variación menor de algo
  existente.
- **No** crear componentes para usos únicos: mantenerlos inline.
- **No** abstraer prematuramente lógica cuya repetición aún no está demostrada
  (motivo por el que `useResource` quedó fuera de esta fase).

---

## 2. Accesibilidad (obligatoria)

La accesibilidad es parte del diseño de cada componente, no un agregado posterior.
Todos los institucionales deben:

- **Preservar** el comportamiento accesible de Radix al envolverlo (foco atrapado,
  cierre con `Escape`, roles) — no romperlo. `CrudFormDialog` y (futuro)
  `ConfirmDialog` heredan esto de `Dialog`; el título debe ir en `DialogTitle`.
- **Teclado y foco:** toda acción es un `<button>`/control nativo enfocable, con
  foco visible; nada de `div` clicables.
- **Formularios:** `FormField` asocia `Label htmlFor` con el `id` del control; el
  indicador visual de requerido **no** sustituye al `required` real. `FormSelect`
  y checkboxes usan elementos nativos (teclado y etiquetas por defecto).
- **Tablas:** `CrudTable` usa `<table>` semántica con `<thead>` y `<th scope="col">`.
- **ARIA cuando corresponda:** iconos decorativos con `aria-hidden`; iconos con
  significado con `aria-label`. `Banner` de error de formulario debería exponer
  `role="alert"` / `aria-live="polite"` (prop opcional a considerar).
- **Contraste:** usar solo los pares de token del proyecto (`text-error` sobre
  `bg-lighterror`, etc.), que cumplen contraste; no inventar combinaciones.

---

## 3. Índice

| Componente | Estado | Patrón que reemplaza |
|---|---|---|
| `PageContainer` | ✅ | Contenedor principal de página |
| `PageHeader` | ✅ | Cabecera de módulo |
| `PageActions` | ✅ | Bloque de acciones de página |
| `SectionCard` | ✅ | Card con barra de encabezado |
| `CrudTable` | ✅ | Tabla de datos estándar |
| `RowActions` | ✅ | Cluster Editar/Eliminar de fila |
| `StatusBadge` | ✅ | Pastilla de estado/categoría |
| `Banner` | ✅ | Mensaje contextual |
| `EmptyState` | ✅ | Listado vacío |
| `LoadingState` | ✅ | Estado de carga |
| `FormField` | ✅ | Label + control |
| `FormSelect` | ✅ | `<select>` estilizado |
| `CheckboxList` | ✅ | Multiselección con scroll |
| `CrudFormDialog` | ✅ | Diálogo de formulario CRUD |
| `useModal` | ✅ | Estado open/editing |
| `getErrorMessage` | ✅ | `ApiError` → texto |
| `ConfirmDialog` | 🕒 | Confirmación (reemplaza `confirm()`) |
| `useConfirm` | 🕒 | Uso imperativo de `ConfirmDialog` |

---

## 4. Estructura de página

### PageContainer ✅

- **Propósito:** contenedor principal de una página.
- **Responsabilidades:** unificar ancho máximo, padding y separación vertical del
  contenido de una página. Base común para módulos privados, Dashboard y el futuro
  módulo público. **No** reemplaza el grid de 12 columnas de las vistas de módulo;
  puede envolverlo.
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** — (div con tokens/utilidades).
- **Props públicas:**
  - `className?: string`
  - `children: ReactNode`
- **Módulos consumidores:** Dashboard y futuro módulo público (adoptable por
  cualquier página que necesite el contenedor estándar).
- **Ejemplo:**
  ```tsx
  <PageContainer>
    <PageHeader icon="..." title="..." />
    {/* contenido */}
  </PageContainer>
  ```

### PageHeader ✅

- **Propósito:** cabecera superior de un módulo.
- **Responsabilidades:** mostrar icono + título + descripción y **un slot de
  acción** a la derecha; ocupar las 12 columnas del grid. **No** conoce los botones
  concretos: el consumidor pasa la acción (normalmente un `PageActions`).
- **Dependencias:** `@iconify/react`, `react`.
- **Reutiliza:** `CardBox` (→ `Card`).
- **Props públicas:**
  - `icon: string`
  - `title: string`
  - `description?: string`
  - `action?: ReactNode`
- **Módulos consumidores:** todos los de `views/school/*`.
- **Ejemplo:**
  ```tsx
  <PageHeader
    icon="solar:user-rounded-linear"
    title="Estudiantes"
    description="Gestión de expedientes."
    action={<PageActions><Button onClick={openCreate}>Registrar</Button></PageActions>}
  />
  ```

### PageActions ✅

- **Propósito:** bloque de acciones de una página (Nuevo, Exportar, Importar,
  Actualizar, Filtros…).
- **Responsabilidades:** disponer un grupo de acciones con alineación y espaciado
  consistentes (responsive: apilado/full-width en móvil). No conoce acciones
  concretas: las recibe como `children`. Mantiene a `PageHeader` agnóstico de los
  botones.
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** — (layout; los botones son `Button` que provee el consumidor).
- **Props públicas:**
  - `className?: string`
  - `children: ReactNode`
- **Módulos consumidores:** dentro del slot `action` de `PageHeader`; también en
  cabeceras de sección con varias acciones.
- **Ejemplo:**
  ```tsx
  <PageActions>
    <Button variant="outline">Exportar</Button>
    <Button onClick={openCreate}>Nuevo</Button>
  </PageActions>
  ```

### SectionCard ✅

- **Propósito:** card de sección con barra de encabezado (título + subtítulo +
  acciones) y cuerpo.
- **Responsabilidades:** estandarizar el patrón `CardBox p-0` con `border-b`
  header; el cuerpo (`children`) queda libre (tabla, formulario, etc.).
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** `CardBox`.
- **Props públicas:**
  - `title?: string`
  - `subtitle?: ReactNode` — típicamente el conteo (`"3 registros"`).
  - `actions?: ReactNode`
  - `bodyClassName?: string`
  - `className?: string`
  - `children: ReactNode`
- **Módulos consumidores:** listas, Matrícula, Asistencia, Calificaciones.
- **Ejemplo:**
  ```tsx
  <SectionCard title="Listado" subtitle={`${data.length} registro(s)`}>
    <CrudTable ... />
  </SectionCard>
  ```

---

## 5. Tabla y acciones

### CrudTable ✅

- **Propósito:** tabla de datos estándar por configuración de columnas.
- **Responsabilidades:** renderizar `thead`/`tbody` con el estilo institucional
  (y `<th scope="col">`); soportar alineación por columna; delegar cada celda a
  `render`; manejar estado `loading`/vacío.
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** markup de tabla + tokens. **Distinto** del `DataTable` legado de
  plantilla (sin TanStack).
- **Props públicas:**
  - `columns: Column<T>[]`, con
    `Column<T> = { key: string; header: ReactNode; render: (row: T) => ReactNode; align?: 'left' | 'right'; className?: string; headerClassName?: string }`.
  - `rows: T[]`
  - `getRowKey: (row: T) => string | number`
  - `loading?: boolean`
  - `emptyMessage?: string`
- **Módulos consumidores:** Estudiantes, Profesores, Administrativos, Encargados,
  Materias, Grupos, Subgrupos, Matrícula.
- **Alcance — resuelve:** estructura y estilo de tabla (`thead`/`tbody`, `th
  scope="col"`, alineación por columna); render por celda vía `render`; estados
  `loading` (→ `LoadingState`) y vacío (→ `EmptyState`). Es una tabla de
  **presentación por configuración de columnas**.
- **Alcance — fuera de su responsabilidad (para no volverlo genérico en exceso):**
  ordenamiento, paginación, filtros/búsqueda, selección de filas, expansión,
  edición inline, virtualización, densidad/variantes, y la obtención de datos.
  Todo eso se resuelve en la vista o se difiere (ver §11). Si un módulo necesita
  alguna de estas capacidades, se compone **por fuera** de `CrudTable` (no se le
  agregan props): el `render` de una columna puede insertar cualquier control, y
  la lógica vive en la vista o en un hook específico cuando se justifique.
- **Ejemplo:**
  ```tsx
  <CrudTable
    rows={estudiantes}
    getRowKey={(e) => e.id_estudiante}
    emptyMessage="No hay estudiantes."
    columns={[
      { key: 'nombre', header: 'Nombre', render: (e) => `${e.name} ${e.sec}` },
      { key: 'estado', header: 'Estado', render: (e) => <StatusBadge active={e.usuario.activo} /> },
      { key: 'acc', header: 'Acciones', align: 'right',
        render: (e) => <RowActions onEdit={() => openEdit(e)} onDelete={() => handleDeactivate(e)} /> },
    ]}
  />
  ```

### RowActions ✅

- **Propósito:** cluster de acciones de fila (Editar / Eliminar o Desactivar).
- **Responsabilidades:** disponer los botones alineados a la derecha con los
  variantes correctos (`ghostprimary` / `ghosterror`).
- **Dependencias:** `react`.
- **Reutiliza:** `Button`.
- **Props públicas:**
  - `onEdit?: () => void`
  - `onDelete?: () => void`
  - `editLabel?: string` (default `'Editar'`)
  - `deleteLabel?: string` (default `'Eliminar'`)
  - `showEdit?: boolean` (default `true`)
  - `showDelete?: boolean` (default `true`)
  - `children?: ReactNode` — override para acciones personalizadas.
- **Módulos consumidores:** todas las listas.
- **Ejemplo:**
  ```tsx
  <RowActions onEdit={() => openEdit(row)} onDelete={() => handleDelete(row)} deleteLabel="Desactivar" />
  ```

---

## 6. Estados y feedback

### StatusBadge ✅

- **Propósito:** pastilla de estado o categoría.
- **Responsabilidades:** con `active` resuelve Activo/Inactivo; en otros casos
  aplica `tone` + `children` (audiencia, tipo, estado).
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** —.
- **Props públicas:**
  - `active?: boolean` — atajo Activo/Inactivo (prioridad).
  - `tone?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'neutral'` (default `'neutral'`).
  - `children?: ReactNode`
  - `className?: string`
- **Módulos consumidores:** personas (activo), Comunicados (audiencia), Calendario
  (tipo), Asistencia (estado), Reportes.
- **Ejemplo:**
  ```tsx
  <StatusBadge active={usuario.activo} />
  <StatusBadge tone="info">{comunicado.dirigido_a}</StatusBadge>
  ```

### Banner ✅

- **Propósito:** mensaje contextual de error/éxito/info/advertencia.
- **Responsabilidades:** aplicar el par de color por tono; envolver el mensaje.
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** —.
- **Props públicas:**
  - `tone?: 'error' | 'success' | 'info' | 'warning'` (default `'error'`).
  - `className?: string`
  - `children: ReactNode`
  - *(planificado)* `role?` / `aria-live` para errores de formulario (accesibilidad).
- **Módulos consumidores:** todos.
- **Ejemplo:**
  ```tsx
  {listError && <Banner tone="error" className="m-6">{listError}</Banner>}
  ```

### EmptyState ✅

- **Propósito:** listado sin registros.
- **Responsabilidades:** mensaje centrado con estilo uniforme.
- **Dependencias:** `cn`.
- **Reutiliza:** —.
- **Props públicas:** `message: string`; `className?: string`; *(planificado)* `icon?: string`.
- **Módulos consumidores:** todas las listas.
- **Ejemplo:** `<EmptyState message="No hay registros." />`

### LoadingState ✅

- **Propósito:** estado de carga de una sección/listado.
- **Responsabilidades:** texto de carga centrado y uniforme.
- **Dependencias:** `cn`.
- **Reutiliza:** —.
- **Props públicas:** `message?: string` (default `'Cargando...'`); `className?: string`.
- **Módulos consumidores:** todos.
- **Ejemplo:** `{loading && <LoadingState />}`

---

## 7. Formularios

### FormField ✅

- **Propósito:** envoltura Label + control.
- **Responsabilidades:** asociar `Label` (`htmlFor`) al control (`children`) con el
  espaciado estándar; indicador de requerido opcional.
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** `Label`.
- **Props públicas:**
  - `label: string`
  - `htmlFor: string`
  - `required?: boolean` — indicador visual (la validación sigue en el control).
  - `className?: string`
  - `children: ReactNode`
- **Módulos consumidores:** todos los formularios.
- **Ejemplo:**
  ```tsx
  <FormField label="Correo institucional" htmlFor="correo">
    <Input id="correo" type="email" value={correo} onChange={...} required />
  </FormField>
  ```

### FormSelect ✅

- **Propósito:** `<select>` nativo estilizado igual que `Input`.
- **Responsabilidades:** aplicar la clase institucional del select (elimina la
  constante `inputClass` copiada en ~10 vistas) y pasar props nativas.
- **Dependencias:** `react` (SelectHTMLAttributes), `cn`.
- **Reutiliza:** tokens de estilo de `Input`.
- **Props públicas:** todas las de `<select>` (`id`, `value`, `onChange`,
  `required`, `disabled`, …) + `className?` + `children` (los `<option>`).
- **Módulos consumidores:** Estudiantes, Profesores, Encargados, Subgrupos, Grupos,
  Matrícula, Calificaciones, Asistencia, Comunicados, Calendario.
- **Ejemplo:**
  ```tsx
  <FormField label="Grupo" htmlFor="grupo">
    <FormSelect id="grupo" value={idGrupo} onChange={(e) => setIdGrupo(e.target.value)}>
      <option value="">Seleccione...</option>
      {grupos.map((g) => <option key={g.id_grupo} value={g.id_grupo}>{g.name_grupo}</option>)}
    </FormSelect>
  </FormField>
  ```

### CheckboxList ✅

- **Propósito:** lista de multiselección con scroll.
- **Responsabilidades:** renderizar checkboxes con etiqueta dentro de un contenedor
  con borde y alto máximo; reportar toggles al padre.
- **Dependencias:** `react`, `cn`.
- **Reutiliza:** checkbox nativo.
- **Props públicas:**
  - `items: T[]`
  - `getId: (item: T) => number`
  - `getLabel: (item: T) => ReactNode`
  - `selected: number[]`
  - `onToggle: (id: number) => void`
  - `emptyText?: string`
  - `columns?: 1 | 2` (default `1`)
  - `maxHeightClassName?: string` (default `'max-h-40'`)
- **Módulos consumidores:** Encargados, Subgrupos.
- **Ejemplo:**
  ```tsx
  <CheckboxList
    items={estudiantes}
    getId={(e) => e.id_estudiante}
    getLabel={(e) => `${e.name_estudiante} ${e.sec_name_estudiante}`}
    selected={estudiantesIds}
    onToggle={toggleEstudiante}
    columns={2}
  />
  ```

### CrudFormDialog ✅

- **Propósito:** andamiaje de un modal-formulario CRUD.
- **Responsabilidades:** envolver `Dialog`/`DialogContent` (conserva el fix de
  cierre), renderizar título, banner de error y pie Cancelar/Guardar; recibir los
  campos como `children`.
- **Dependencias:** `react` (FormEvent, ReactNode), `cn`.
- **Reutiliza:** `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`,
  `Button`, `Banner`.
- **Props públicas:**
  - `open: boolean`, `onOpenChange: (open: boolean) => void`
  - `title: string`
  - `error?: string | null`
  - `saving?: boolean`
  - `submitLabel?: string` (default `'Guardar'`)
  - `onSubmit: (e: FormEvent) => void`
  - `className?: string` — ancho del `DialogContent`.
  - `children: ReactNode`
- **Módulos consumidores:** todos los CRUD.
- **Ejemplo:**
  ```tsx
  <CrudFormDialog open={open} onOpenChange={setOpen}
    title={editing ? 'Editar materia' : 'Nueva materia'}
    error={formError} saving={saving} onSubmit={handleSubmit} className="max-w-md">
    <FormField label="Nombre" htmlFor="nombre">
      <Input id="nombre" value={nombre} onChange={...} required />
    </FormField>
  </CrudFormDialog>
  ```

---

## 8. Hooks y helpers

### useModal\<T\> ✅ — `src/hooks/useModal.ts`

- **Propósito:** manejar el estado open/editing de las vistas CRUD.
- **Responsabilidades:** abrir en modo crear (`editing = null`) o editar
  (`editing = registro`) y cerrar. La vista sigue precargando/limpiando el
  formulario.
- **Dependencias:** `react`.
- **API:** `useModal<T>() => { open, setOpen, editing, openCreate, openEdit(item), close }`.
- **Módulos consumidores:** todos los CRUD.
- **Ejemplo:**
  ```tsx
  const { open, setOpen, editing, openCreate, openEdit } = useModal<Asignatura>();
  useEffect(() => { if (open) setNombre(editing ? editing.name : ''); }, [open, editing]);
  ```

### getErrorMessage ✅ — `src/lib/` (ubicación por confirmar)

- **Propósito:** traducir un error a texto para la UI.
- **Responsabilidades:** devolver `err.message` si es `ApiError`, o un `fallback`.
- **Dependencias:** `ApiError` (`src/lib/api`).
- **API:** `getErrorMessage(err: unknown, fallback: string): string`.
- **Módulos consumidores:** todos (unifica `err instanceof ApiError ? ... : ...`).
- **Ejemplo:** `catch (err) { setError(getErrorMessage(err, 'No se pudo guardar.')); }`

---

## 9. Planificado para fase posterior (🕒 no implementar aún)

### ConfirmDialog 🕒

- **Propósito:** confirmación institucional para acciones destructivas (reemplaza
  `window.confirm()`).
- **Responsabilidades:** diálogo con título, mensaje y botones Confirmar/Cancelar;
  manejo de foco/teclado heredado de Radix `Dialog`.
- **Reutiliza:** `Dialog`, `DialogContent`, `Button`, `Banner`.
- **Props públicas (previstas):** `open`, `onOpenChange`, `title`, `message`,
  `confirmLabel?`, `cancelLabel?`, `tone?: 'error' | 'warning'`, `onConfirm`.
- **Módulos consumidores:** todos los flujos de eliminar/desactivar.
- **Motivo de aplazamiento:** afecta muchos flujos; se introduce cuando la nueva
  capa esté consolidada.

### useConfirm 🕒 — `src/hooks/useConfirm.ts`

- **Propósito:** usar `ConfirmDialog` de forma imperativa, sin manejar apertura y
  cierre en cada vista.
- **Responsabilidades:** exponer un `confirm(opts)` que muestra el diálogo y
  resuelve una promesa con `true`/`false`; montar el `ConfirmDialog` una sola vez
  (provider o portal interno).
- **API (prevista):** `const confirm = useConfirm(); const ok = await confirm({ title, message });`
- **Ejemplo:**
  ```tsx
  const confirm = useConfirm();
  const handleDelete = async (row) => {
    const ok = await confirm({ title: 'Eliminar', message: `¿Eliminar "${row.nombre}"?` });
    if (!ok) return;
    await deleteX(row.id);
  };
  ```
- **Motivo de aplazamiento:** acompaña a `ConfirmDialog`.

---

## 10. Plan de migración incremental

Metodología por pieza: **diseñar → revisar → implementar → verificar (`tsc`,
`lint`, pruebas funcionales) → revisar de nuevo**.

1. **Crear los componentes ✅** de esta fase (sin tocar vistas): `PageContainer`,
   `PageActions`, `SectionCard`, `CrudTable`, `RowActions`, `FormField`,
   `FormSelect`, `CheckboxList`, y el helper `getErrorMessage`. Verificar y revisar.
2. **Piloto: `Materias`** — completar su migración sobre la capa ya consolidada
   (ya adoptó `PageHeader`/`Banner`/`EmptyState`/`CrudFormDialog`/`useModal`;
   incorporará `SectionCard`/`CrudTable`/`RowActions`/`FormField`). Verificar en
   navegador y **pausar** para revisión.
3. **Extensión por olas**, revisando entre cada una:
   - **Ola A:** Estudiantes, Profesores, Administrativos, Encargados.
   - **Ola B:** Grupos, Subgrupos.
   - **Ola C:** Comunicados, Calendario.
   - **Ola D:** Matrícula, Asistencia, Calificaciones, Reportes.

---

## 11. Fuera del catálogo (se mantiene como está / diferido)

- **`useResource`:** retirado del alcance. Hoy `useEffect` + servicios funcionan
  bien; el hook se justificaría solo con una solución de server-state (p. ej.
  TanStack Query), que no se introduce en esta fase.
- **`useCrud`, `usePagination`, `useSearch`, `useFilters`:** diferidos hasta que un
  módulo real los justifique (evitar sobre-abstracción / YAGNI).
- **Tablas de roster** con inputs por fila (Asistencia, Calificaciones): adoptan
  `PageHeader`/`SectionCard`/`Banner`/`FormSelect`, pero conservan su tabla propia.
- **Dashboard:** visuales propios (adoptará `PageContainer` y, donde aplique, la
  capa institucional).
