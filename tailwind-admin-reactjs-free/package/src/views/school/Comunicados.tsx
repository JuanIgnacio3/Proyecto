import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import CardBox from 'src/components/shared/CardBox';
import {
  CrudScaffold,
  FormSelect,
  Pagination,
  PublicationBadge,
  SearchInput,
  StatusBadge,
  useConfirm,
  VisibilityFilter,
  type Visibilidad,
} from 'src/components/institutional';
import { usePagination } from 'src/hooks/usePagination';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';
import { matchText } from 'src/lib/search';
import {
  activateComunicado,
  createComunicado,
  deleteComunicado,
  listComunicados,
  updateComunicado,
} from 'src/lib/comunicados';
import { canManageComunicados } from 'src/lib/roles';
import type {
  Audiencia,
  CategoriaPublica,
  Comunicado,
  ComunicadoInput,
} from 'src/types/comunicado';

const AUDIENCIAS: Audiencia[] = ['Todos', 'Estudiantes', 'Profesores', 'Encargados'];
const CATEGORIAS: CategoriaPublica[] = [
  'Institucional',
  'Académico',
  'Admisión',
  'Eventos',
  'Logros',
];

const audienciaColor: Record<Audiencia, string> = {
  Todos: 'bg-lightprimary text-primary',
  Estudiantes: 'bg-lightsuccess text-success',
  Profesores: 'bg-lightwarning text-warning',
  Encargados: 'bg-lightinfo text-info',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const emptyForm = {
  titulo: '',
  cuerpo: '',
  dirigido_a: 'Todos' as Audiencia,
  es_publico: false,
  categoria: '' as '' | CategoriaPublica,
};

const formatFecha = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-CR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const Comunicados = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const canManage = canManageComunicados(user?.rol.name_rol);

  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [fVisibilidad, setFVisibilidad] = useState<Visibilidad>('todos');
  const [fCategoria, setFCategoria] = useState<'todas' | CategoriaPublica>('todas');
  const [query, setQuery] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Comunicado | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setComunicados(await listComunicados());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudieron cargar los comunicados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibles = useMemo(
    () =>
      comunicados.filter((c) => {
        if (fVisibilidad === 'publicos' && !c.es_publico) return false;
        if (fVisibilidad === 'privados' && c.es_publico) return false;
        if (fCategoria !== 'todas' && c.categoria !== fCategoria) return false;
        if (!matchText(query, c.titulo, c.cuerpo, c.categoria, c.dirigido_a, c.autor_correo))
          return false;
        return true;
      }),
    [comunicados, fVisibilidad, fCategoria, query],
  );
  const paginacion = usePagination(visibles, 6);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (c: Comunicado) => {
    setEditing(c);
    setForm({
      titulo: c.titulo,
      cuerpo: c.cuerpo,
      dirigido_a: c.dirigido_a,
      es_publico: c.es_publico,
      categoria: c.categoria ?? '',
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload: ComunicadoInput = {
        titulo: form.titulo,
        cuerpo: form.cuerpo,
        dirigido_a: form.dirigido_a,
        es_publico: form.es_publico,
        categoria: form.categoria || null,
      };
      if (editing) {
        await updateComunicado(editing.id_comunicado, payload);
      } else {
        await createComunicado(payload);
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el comunicado.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (c: Comunicado) => {
    if (
      !(await confirm({
        title: `Desactivar el comunicado "${c.titulo}"?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deleteComunicado(c.id_comunicado);
      await load();
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo desactivar.');
    }
  };

  const handleActivate = async (c: Comunicado) => {
    try {
      await activateComunicado(c.id_comunicado);
      await load();
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo activar.');
    }
  };

  return (
    <>
      <CrudScaffold
        icon="solar:notification-unread-linear"
        title="Comunicados"
        subtitle="Avisos institucionales publicados para la comunidad educativa."
        newLabel="Nuevo comunicado"
        onNew={openCreate}
        canManage={canManage}
        loading={loading}
        error={listError}
        total={comunicados.length}
        shown={visibles.length}
        emptyMessage='No hay comunicados. Crea el primero con "Nuevo comunicado".'
        filteredEmptyMessage="Ningún comunicado coincide con el filtro seleccionado."
        filters={
          <>
            <SearchInput value={query} onChange={setQuery} placeholder="Buscar comunicado..." />
            <VisibilityFilter value={fVisibilidad} onChange={setFVisibilidad} />
            <div className="flex items-center gap-2">
              <Label htmlFor="fcat" className="text-sm text-muted-foreground">
                Categoría
              </Label>
              <FormSelect
                id="fcat"
                className={`${inputClass} w-auto`}
                value={fCategoria}
                onChange={(e) => setFCategoria(e.target.value as 'todas' | CategoriaPublica)}
              >
                <option value="todas">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </FormSelect>
            </div>
          </>
        }
      >
        {paginacion.pageItems.map((c) => (
          <div key={c.id_comunicado} className="col-span-12 lg:col-span-6">
            <CardBox className="flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${audienciaColor[c.dirigido_a]}`}
                  >
                    {c.dirigido_a}
                  </span>
                  <PublicationBadge isPublic={c.es_publico} />
                  {c.es_publico && c.categoria && (
                    <span className="rounded-full bg-lightprimary px-3 py-1 text-xs font-medium text-primary">
                      {c.categoria}
                    </span>
                  )}
                  {canManage && !c.activo && <StatusBadge active={c.activo} />}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFecha(c.fecha_publicacion)}
                </span>
              </div>

              <h2 className="mt-3 text-lg font-semibold">{c.titulo}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{c.cuerpo}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-ld pt-3">
                <span className="min-w-0 break-words text-xs text-muted-foreground">
                  Por: {c.autor_correo}
                </span>
                {canManage && (
                  <div className="flex gap-2">
                    <Button variant="ghostprimary" size="sm" onClick={() => openEdit(c)}>
                      Editar
                    </Button>
                    {c.activo ? (
                      <Button variant="ghosterror" size="sm" onClick={() => handleDeactivate(c)}>
                        Desactivar
                      </Button>
                    ) : (
                      <Button variant="ghostprimary" size="sm" onClick={() => handleActivate(c)}>
                        Activar
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardBox>
          </div>
        ))}
        {visibles.length > 0 && (
          <div className="col-span-12">
            <CardBox className="p-0">
              <Pagination
                className="border-t-0"
                page={paginacion.page}
                pageCount={paginacion.pageCount}
                onPageChange={paginacion.setPage}
                rangeStart={paginacion.rangeStart}
                rangeEnd={paginacion.rangeEnd}
                total={paginacion.total}
              />
            </CardBox>
          </div>
        )}
      </CrudScaffold>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar comunicado' : 'Nuevo comunicado'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="ctitulo">Titulo</Label>
              <Input
                id="ctitulo"
                className="mt-1"
                value={form.titulo}
                onChange={(e) => setField('titulo', e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="cdirigido">Dirigido a</Label>
              <FormSelect
                id="cdirigido"
                className={`${inputClass} mt-1`}
                value={form.dirigido_a}
                onChange={(e) => setField('dirigido_a', e.target.value)}
              >
                {AUDIENCIAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </FormSelect>
            </div>

            <div>
              <Label htmlFor="ccuerpo">Mensaje</Label>
              <textarea
                id="ccuerpo"
                className={`${inputClass} mt-1 h-32 py-2`}
                value={form.cuerpo}
                onChange={(e) => setField('cuerpo', e.target.value)}
                required
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Checkbox
                id="cpublico"
                checked={form.es_publico}
                onCheckedChange={(v) => setForm((prev) => ({ ...prev, es_publico: v === true }))}
              />
              <Label htmlFor="cpublico" className="cursor-pointer">
                Publicar en el sitio web
              </Label>
            </div>

            {form.es_publico && (
              <div className="mt-4">
                <Label htmlFor="ccategoria">Categoría del sitio web</Label>
                <FormSelect
                  id="ccategoria"
                  className={`${inputClass} mt-1`}
                  value={form.categoria}
                  onChange={(e) => setField('categoria', e.target.value)}
                >
                  <option value="">Sin categoría</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </FormSelect>
                <p className="mt-1 text-xs text-muted-foreground">
                  Se muestra como etiqueta en la sección Noticias del sitio.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Comunicados;
