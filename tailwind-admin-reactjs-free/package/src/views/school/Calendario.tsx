import { Icon } from '@iconify/react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
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
import { createEvento, deleteEvento, listEventos, updateEvento } from 'src/lib/eventos';
import { canManageCalendario } from 'src/lib/roles';
import type { Evento, TipoEvento } from 'src/types/evento';

const TIPOS: TipoEvento[] = [
  'Reunion',
  'Evaluacion',
  'Actividad',
  'Feriado',
  'Entrega',
  'Otro',
];

const tipoColor: Record<TipoEvento, string> = {
  Reunion: 'bg-lightprimary text-primary',
  Evaluacion: 'bg-lightwarning text-warning',
  Actividad: 'bg-lightsuccess text-success',
  Feriado: 'bg-lighterror text-error',
  Entrega: 'bg-lightinfo text-info',
  Otro: 'bg-muted text-muted-foreground',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const emptyForm = {
  titulo: '',
  descripcion: '',
  fecha_inicio: '',
  fecha_fin: '',
  tipo: 'Actividad' as TipoEvento,
};

// Interpreta 'YYYY-MM-DD' como fecha local (evita el corrimiento por zona horaria).
const parseFecha = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const mesAnio = (iso: string) =>
  parseFecha(iso).toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });

const diaCorto = (iso: string) =>
  parseFecha(iso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });

const Calendario = () => {
  const { user } = useAuth();
  const canManage = canManageCalendario(user?.rol.name_rol);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evento | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setEventos(await listEventos());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grupos = useMemo(() => {
    const map = new Map<string, Evento[]>();
    eventos.forEach((e) => {
      const key = mesAnio(e.fecha_inicio);
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    });
    return [...map.entries()];
  }, [eventos]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (e: Evento) => {
    setEditing(e);
    setForm({
      titulo: e.titulo,
      descripcion: e.descripcion ?? '',
      fecha_inicio: e.fecha_inicio,
      fecha_fin: e.fecha_fin ?? '',
      tipo: e.tipo,
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        tipo: form.tipo,
      };
      if (editing) {
        await updateEvento(editing.id_evento, payload);
      } else {
        await createEvento(payload);
      }
      setOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el evento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e: Evento) => {
    if (!confirm(`Eliminar el evento "${e.titulo}"?`)) return;
    try {
      await deleteEvento(e.id_evento);
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
                <Icon icon="solar:calendar-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Calendario</h1>
                <p className="mt-1 text-muted-foreground">
                  Agenda de actividades y eventos institucionales.
                </p>
              </div>
            </div>
            {canManage && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Nuevo evento
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

      {!loading && !listError && eventos.length === 0 && (
        <div className="col-span-12">
          <CardBox className="p-10 text-center text-muted-foreground">
            No hay eventos programados.
          </CardBox>
        </div>
      )}

      {grupos.map(([mes, items]) => (
        <div key={mes} className="col-span-12">
          <CardBox className="p-0 overflow-hidden">
            <div className="border-b border-ld px-6 py-4">
              <h2 className="text-lg font-semibold capitalize">{mes}</h2>
            </div>
            <div className="divide-y divide-ld">
              {items.map((e) => {
                const pasado = parseFecha(e.fecha_fin ?? e.fecha_inicio) < hoy;
                return (
                  <div
                    key={e.id_evento}
                    className={`flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center ${
                      pasado ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-semibold capitalize">
                        {diaCorto(e.fecha_inicio)}
                      </p>
                      {e.fecha_fin && (
                        <p className="text-xs text-muted-foreground capitalize">
                          al {diaCorto(e.fecha_fin)}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoColor[e.tipo]}`}
                        >
                          {e.tipo}
                        </span>
                        <h3 className="font-medium">{e.titulo}</h3>
                      </div>
                      {e.descripcion && (
                        <p className="mt-1 text-sm text-muted-foreground">{e.descripcion}</p>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <Button variant="ghostprimary" size="sm" onClick={() => openEdit(e)}>
                          Editar
                        </Button>
                        <Button variant="ghosterror" size="sm" onClick={() => handleDelete(e)}>
                          Eliminar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardBox>
        </div>
      ))}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="etitulo">Titulo</Label>
              <Input
                id="etitulo"
                className="mt-1"
                value={form.titulo}
                onChange={(e) => setField('titulo', e.target.value)}
                required
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="einicio">Fecha inicio</Label>
                <Input
                  id="einicio"
                  type="date"
                  className="mt-1"
                  value={form.fecha_inicio}
                  onChange={(e) => setField('fecha_inicio', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="efin">Fecha fin</Label>
                <Input
                  id="efin"
                  type="date"
                  className="mt-1"
                  value={form.fecha_fin}
                  onChange={(e) => setField('fecha_fin', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="etipo">Tipo</Label>
                <select
                  id="etipo"
                  className={`${inputClass} mt-1`}
                  value={form.tipo}
                  onChange={(e) => setField('tipo', e.target.value)}
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="edesc">Descripcion (opcional)</Label>
              <textarea
                id="edesc"
                className={`${inputClass} mt-1 h-24 py-2`}
                value={form.descripcion}
                onChange={(e) => setField('descripcion', e.target.value)}
              />
            </div>

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
    </div>
  );
};

export default Calendario;
