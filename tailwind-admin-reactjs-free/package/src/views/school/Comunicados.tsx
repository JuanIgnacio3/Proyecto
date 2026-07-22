import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import CardBox from 'src/components/shared/CardBox';
import { Button } from 'src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { ApiError } from 'src/lib/api';
import {
  createComunicado,
  deleteComunicado,
  listComunicados,
  updateComunicado,
} from 'src/lib/comunicados';
import { canManageComunicados } from 'src/lib/roles';
import type { Audiencia, Comunicado } from 'src/types/comunicado';

const AUDIENCIAS: Audiencia[] = ['Todos', 'Estudiantes', 'Profesores', 'Encargados'];

const audienciaColor: Record<Audiencia, string> = {
  Todos: 'bg-lightprimary text-primary',
  Estudiantes: 'bg-lightsuccess text-success',
  Profesores: 'bg-lightwarning text-warning',
  Encargados: 'bg-lightinfo text-info',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const emptyForm = { titulo: '', cuerpo: '', dirigido_a: 'Todos' as Audiencia };

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
  const canManage = canManageComunicados(user?.rol.name_rol);

  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

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
    setForm({ titulo: c.titulo, cuerpo: c.cuerpo, dirigido_a: c.dirigido_a });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateComunicado(editing.id_comunicado, form);
      } else {
        await createComunicado(form);
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el comunicado.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Comunicado) => {
    if (!confirm(`Eliminar el comunicado "${c.titulo}"?`)) return;
    try {
      await deleteComunicado(c.id_comunicado);
      await load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo eliminar.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <Icon icon="solar:notification-unread-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Comunicados</h1>
                <p className="mt-1 text-muted-foreground">
                  Avisos institucionales publicados para la comunidad educativa.
                </p>
              </div>
            </div>
            {canManage && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Nuevo comunicado
              </Button>
            )}
          </div>
        </CardBox>
      </div>

      {listError && (
        <div className="col-span-12">
          <div className="rounded-md bg-lighterror px-4 py-3 text-sm text-error">{listError}</div>
        </div>
      )}

      {loading && (
        <div className="col-span-12">
          <CardBox className="p-10 text-center text-muted-foreground">Cargando...</CardBox>
        </div>
      )}

      {!loading && !listError && comunicados.length === 0 && (
        <div className="col-span-12">
          <CardBox className="p-10 text-center text-muted-foreground">
            No hay comunicados publicados.
          </CardBox>
        </div>
      )}

      {comunicados.map((c) => (
        <div key={c.id_comunicado} className="col-span-12 lg:col-span-6">
          <CardBox className="flex h-full flex-col p-6">
            <div className="flex items-start justify-between gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${audienciaColor[c.dirigido_a]}`}
              >
                {c.dirigido_a}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatFecha(c.fecha_publicacion)}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold">{c.titulo}</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{c.cuerpo}</p>

            <div className="mt-4 flex items-center justify-between border-t border-ld pt-3">
              <span className="text-xs text-muted-foreground">Por: {c.autor_correo}</span>
              {canManage && (
                <div className="flex gap-2">
                  <Button variant="ghostprimary" size="sm" onClick={() => openEdit(c)}>
                    Editar
                  </Button>
                  <Button variant="ghosterror" size="sm" onClick={() => handleDelete(c)}>
                    Eliminar
                  </Button>
                </div>
              )}
            </div>
          </CardBox>
        </div>
      ))}

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
              <select
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
              </select>
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

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Publicar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Comunicados;
