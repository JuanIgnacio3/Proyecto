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
  createAdministrativo,
  deactivateAdministrativo,
  listAdministrativos,
  updateAdministrativo,
} from 'src/lib/administrativos';
import { listTiposDocumento } from 'src/lib/estudiantes';
import type { Administrativo } from 'src/types/administrativo';
import type { TipoDocumento } from 'src/types/estudiante';

const emptyForm = {
  name_administrativo: '',
  sec_name_administrativo: '',
  id_tipo_documento: '',
  num_documento_administrativo: '',
  phone_num_administrativo: '',
  direction_administrativo: '',
  cargo: '',
  correo_institucional: '',
  password: '',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Administrativos = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [administrativos, setAdministrativos] = useState<Administrativo[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Administrativo | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAdministrativos = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setAdministrativos(await listAdministrativos());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdministrativos();
  }, [loadAdministrativos]);

  useEffect(() => {
    if (!open) return;
    listTiposDocumento()
      .then(setTipos)
      .catch(() => {
        /* el select quedara vacio; el backend valida igual */
      });
  }, [open]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (adm: Administrativo) => {
    setEditing(adm);
    setForm({
      name_administrativo: adm.name_administrativo,
      sec_name_administrativo: adm.sec_name_administrativo,
      id_tipo_documento: String(adm.id_tipo_documento),
      num_documento_administrativo: adm.num_documento_administrativo,
      phone_num_administrativo: adm.phone_num_administrativo ?? '',
      direction_administrativo: adm.direction_administrativo ?? '',
      cargo: adm.cargo,
      correo_institucional: '',
      password: '',
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const base = {
        name_administrativo: form.name_administrativo,
        sec_name_administrativo: form.sec_name_administrativo,
        id_tipo_documento: Number(form.id_tipo_documento),
        num_documento_administrativo: form.num_documento_administrativo,
        phone_num_administrativo: form.phone_num_administrativo || null,
        direction_administrativo: form.direction_administrativo || null,
        cargo: form.cargo,
      };
      if (editing) {
        await updateAdministrativo(editing.id_administrativo, base);
      } else {
        await createAdministrativo({
          ...base,
          correo_institucional: form.correo_institucional,
          password: form.password,
        });
      }
      setOpen(false);
      await loadAdministrativos();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el administrativo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (adm: Administrativo) => {
    if (!confirm(`Desactivar a ${adm.name_administrativo} ${adm.sec_name_administrativo}?`)) return;
    try {
      await deactivateAdministrativo(adm.id_administrativo);
      await loadAdministrativos();
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
                <Icon icon="solar:users-group-rounded-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Administrativos</h1>
                <p className="mt-1 text-muted-foreground">
                  Personal administrativo con acceso limitado al sistema.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Registrar administrativo
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
              {loading ? 'Cargando...' : `${administrativos.length} administrativo(s) registrado(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && administrativos.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay administrativos registrados todavia.
            </div>
          )}

          {administrativos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-sm font-semibold">Cargo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Documento</th>
                    <th className="px-6 py-3 text-sm font-semibold">Correo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {administrativos.map((adm) => (
                    <tr key={adm.id_administrativo} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 font-medium">
                        {adm.name_administrativo} {adm.sec_name_administrativo}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{adm.cargo}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {adm.num_documento_administrativo}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {adm.usuario.correo_institucional}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            adm.usuario.activo
                              ? 'bg-lightsuccess text-success'
                              : 'bg-lighterror text-error'
                          }`}
                        >
                          {adm.usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(adm)}
                            >
                              Editar
                            </Button>
                            {adm.usuario.activo && (
                              <Button
                                variant="ghosterror"
                                size="sm"
                                onClick={() => handleDeactivate(adm)}
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
            <DialogTitle>
              {editing ? 'Editar administrativo' : 'Registrar administrativo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="aname">Nombre</Label>
                <Input
                  id="aname"
                  className="mt-1"
                  value={form.name_administrativo}
                  onChange={(e) => setField('name_administrativo', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="asecName">Apellidos</Label>
                <Input
                  id="asecName"
                  className="mt-1"
                  value={form.sec_name_administrativo}
                  onChange={(e) => setField('sec_name_administrativo', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="acargo">Cargo</Label>
                <Input
                  id="acargo"
                  className="mt-1"
                  value={form.cargo}
                  onChange={(e) => setField('cargo', e.target.value)}
                  placeholder="Ej. Secretaria, Orientador"
                  required
                />
              </div>
              <div>
                <Label htmlFor="aphone">Telefono</Label>
                <Input
                  id="aphone"
                  className="mt-1"
                  value={form.phone_num_administrativo}
                  onChange={(e) => setField('phone_num_administrativo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="atipoDoc">Tipo de documento</Label>
                <select
                  id="atipoDoc"
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
                <Label htmlFor="anumDoc">Numero de documento</Label>
                <Input
                  id="anumDoc"
                  className="mt-1"
                  value={form.num_documento_administrativo}
                  onChange={(e) => setField('num_documento_administrativo', e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="adirection">Direccion</Label>
                <Input
                  id="adirection"
                  className="mt-1"
                  value={form.direction_administrativo}
                  onChange={(e) => setField('direction_administrativo', e.target.value)}
                />
              </div>
              {!editing && (
                <>
                  <div>
                    <Label htmlFor="acorreo">Correo institucional</Label>
                    <Input
                      id="acorreo"
                      type="email"
                      className="mt-1"
                      value={form.correo_institucional}
                      onChange={(e) => setField('correo_institucional', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="apwd">Contrasena inicial</Label>
                    <Input
                      id="apwd"
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

export default Administrativos;
