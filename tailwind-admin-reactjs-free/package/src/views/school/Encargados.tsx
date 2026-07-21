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
  createEncargado,
  deactivateEncargado,
  listEncargados,
  updateEncargado,
} from 'src/lib/encargados';
import { listEstudiantes, listTiposDocumento } from 'src/lib/estudiantes';
import type { Encargado } from 'src/types/encargado';
import type { Estudiante, TipoDocumento } from 'src/types/estudiante';

const emptyForm = {
  name_encargado: '',
  sec_name_encargado: '',
  id_tipo_documento: '',
  num_documento_encargado: '',
  phone_num_encargado: '',
  direction_encargado: '',
  parentesco: '',
  correo_institucional: '',
  password: '',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Encargados = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Encargado | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [estudiantesIds, setEstudiantesIds] = useState<number[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEncargados = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setEncargados(await listEncargados());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEncargados();
  }, [loadEncargados]);

  useEffect(() => {
    if (!open) return;
    Promise.all([listTiposDocumento(), listEstudiantes()])
      .then(([t, e]) => {
        setTipos(t);
        setEstudiantes(e);
      })
      .catch(() => {
        /* los selects quedaran vacios; el backend valida igual */
      });
  }, [open]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleEstudiante = (id: number) =>
    setEstudiantesIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setEstudiantesIds([]);
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (enc: Encargado) => {
    setEditing(enc);
    setForm({
      name_encargado: enc.name_encargado,
      sec_name_encargado: enc.sec_name_encargado,
      id_tipo_documento: String(enc.id_tipo_documento),
      num_documento_encargado: enc.num_documento_encargado,
      phone_num_encargado: enc.phone_num_encargado ?? '',
      direction_encargado: enc.direction_encargado ?? '',
      parentesco: enc.parentesco,
      correo_institucional: '',
      password: '',
    });
    setEstudiantesIds(enc.estudiantes.map((e) => e.id_estudiante));
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const base = {
        name_encargado: form.name_encargado,
        sec_name_encargado: form.sec_name_encargado,
        id_tipo_documento: Number(form.id_tipo_documento),
        num_documento_encargado: form.num_documento_encargado,
        phone_num_encargado: form.phone_num_encargado || null,
        direction_encargado: form.direction_encargado || null,
        parentesco: form.parentesco,
        estudiantes_ids: estudiantesIds,
      };
      if (editing) {
        await updateEncargado(editing.id_encargado, base);
      } else {
        await createEncargado({
          ...base,
          correo_institucional: form.correo_institucional,
          password: form.password,
        });
      }
      setOpen(false);
      await loadEncargados();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el encargado.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (enc: Encargado) => {
    if (!confirm(`Desactivar a ${enc.name_encargado} ${enc.sec_name_encargado}?`)) return;
    try {
      await deactivateEncargado(enc.id_encargado);
      await loadEncargados();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'No se pudo desactivar.');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <Icon icon="solar:user-hand-up-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Encargados</h1>
                <p className="mt-1 text-muted-foreground">
                  Padres, madres o tutores legales asociados a estudiantes.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Registrar encargado
              </Button>
            )}
          </div>
        </CardBox>
      </div>

      <div className="col-span-12">
        <CardBox className="p-0 overflow-hidden">
          <div className="border-b border-ld px-6 py-4">
            <h2 className="text-lg font-semibold">Listado</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Cargando...' : `${encargados.length} encargado(s) registrado(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && encargados.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay encargados registrados todavia.
            </div>
          )}

          {encargados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-sm font-semibold">Parentesco</th>
                    <th className="px-6 py-3 text-sm font-semibold">Estudiantes</th>
                    <th className="px-6 py-3 text-sm font-semibold">Correo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {encargados.map((enc) => (
                    <tr key={enc.id_encargado} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 font-medium">
                        {enc.name_encargado} {enc.sec_name_encargado}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{enc.parentesco}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {enc.estudiantes.length === 0
                          ? '-'
                          : enc.estudiantes
                              .map((e) => `${e.name_estudiante} ${e.sec_name_estudiante}`)
                              .join(', ')}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {enc.usuario.correo_institucional}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            enc.usuario.activo
                              ? 'bg-lightsuccess text-success'
                              : 'bg-lighterror text-error'
                          }`}
                        >
                          {enc.usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(enc)}
                            >
                              Editar
                            </Button>
                            {enc.usuario.activo && (
                              <Button
                                variant="ghosterror"
                                size="sm"
                                onClick={() => handleDeactivate(enc)}
                              >
                                Desactivar
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBox>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar encargado' : 'Registrar encargado'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ename">Nombre</Label>
                <Input
                  id="ename"
                  className="mt-1"
                  value={form.name_encargado}
                  onChange={(e) => setField('name_encargado', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="esecName">Apellidos</Label>
                <Input
                  id="esecName"
                  className="mt-1"
                  value={form.sec_name_encargado}
                  onChange={(e) => setField('sec_name_encargado', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="etipoDoc">Tipo de documento</Label>
                <select
                  id="etipoDoc"
                  className={`${inputClass} mt-1`}
                  value={form.id_tipo_documento}
                  onChange={(e) => setField('id_tipo_documento', e.target.value)}
                  required
                >
                  <option value="">Seleccione...</option>
                  {tipos.map((t) => (
                    <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                      {t.name_tipo_documento}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="enumDoc">Numero de documento</Label>
                <Input
                  id="enumDoc"
                  className="mt-1"
                  value={form.num_documento_encargado}
                  onChange={(e) => setField('num_documento_encargado', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ephone">Telefono</Label>
                <Input
                  id="ephone"
                  className="mt-1"
                  value={form.phone_num_encargado}
                  onChange={(e) => setField('phone_num_encargado', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="eparentesco">Parentesco</Label>
                <Input
                  id="eparentesco"
                  className="mt-1"
                  value={form.parentesco}
                  onChange={(e) => setField('parentesco', e.target.value)}
                  placeholder="Ej. Madre, Padre, Tutor"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="edirection">Direccion</Label>
                <Input
                  id="edirection"
                  className="mt-1"
                  value={form.direction_encargado}
                  onChange={(e) => setField('direction_encargado', e.target.value)}
                />
              </div>
              {!editing && (
                <>
                  <div>
                    <Label htmlFor="ecorreo">Correo institucional</Label>
                    <Input
                      id="ecorreo"
                      type="email"
                      className="mt-1"
                      value={form.correo_institucional}
                      onChange={(e) => setField('correo_institucional', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="epwd">Contrasena inicial</Label>
                    <Input
                      id="epwd"
                      type="password"
                      className="mt-1"
                      value={form.password}
                      onChange={(e) => setField('password', e.target.value)}
                      minLength={8}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <Label>Estudiantes a cargo</Label>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-ld p-3">
                {estudiantes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay estudiantes disponibles.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {estudiantes.map((est) => (
                      <label
                        key={est.id_estudiante}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={estudiantesIds.includes(est.id_estudiante)}
                          onChange={() => toggleEstudiante(est.id_estudiante)}
                        />
                        <span>
                          {est.name_estudiante} {est.sec_name_estudiante}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
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

export default Encargados;
