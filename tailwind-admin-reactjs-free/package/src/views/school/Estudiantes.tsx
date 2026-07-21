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
  createEstudiante,
  deactivateEstudiante,
  listEstudiantes,
  listGrupos,
  listTiposDocumento,
  updateEstudiante,
} from 'src/lib/estudiantes';
import type { Estudiante, Grupo, TipoDocumento } from 'src/types/estudiante';

const emptyForm = {
  name_estudiante: '',
  sec_name_estudiante: '',
  birthdate_estudiante: '',
  direction_estudiante: '',
  phone_num_estudiante: '',
  id_tipo_documento: '',
  num_documento_estudiante: '',
  id_grupo: '',
  correo_institucional: '',
  password: '',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Estudiantes = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Estudiante | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEstudiantes = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setEstudiantes(await listEstudiantes());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstudiantes();
  }, [loadEstudiantes]);

  useEffect(() => {
    if (!open) return;
    Promise.all([listTiposDocumento(), listGrupos()])
      .then(([t, g]) => {
        setTipos(t);
        setGrupos(g);
      })
      .catch(() => {
        /* los selects quedaran vacios; el backend valida igual */
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

  const openEdit = (est: Estudiante) => {
    setEditing(est);
    setForm({
      name_estudiante: est.name_estudiante,
      sec_name_estudiante: est.sec_name_estudiante,
      birthdate_estudiante: est.birthdate_estudiante,
      direction_estudiante: est.direction_estudiante ?? '',
      phone_num_estudiante: est.phone_num_estudiante ?? '',
      id_tipo_documento: String(est.id_tipo_documento),
      num_documento_estudiante: est.num_documento_estudiante,
      id_grupo: est.id_grupo ? String(est.id_grupo) : '',
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
        name_estudiante: form.name_estudiante,
        sec_name_estudiante: form.sec_name_estudiante,
        birthdate_estudiante: form.birthdate_estudiante,
        direction_estudiante: form.direction_estudiante || null,
        phone_num_estudiante: form.phone_num_estudiante || null,
        id_tipo_documento: Number(form.id_tipo_documento),
        num_documento_estudiante: form.num_documento_estudiante,
        id_grupo: form.id_grupo ? Number(form.id_grupo) : null,
      };
      if (editing) {
        await updateEstudiante(editing.id_estudiante, base);
      } else {
        await createEstudiante({
          ...base,
          correo_institucional: form.correo_institucional,
          password: form.password,
        });
      }
      setOpen(false);
      await loadEstudiantes();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el estudiante.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (est: Estudiante) => {
    if (!confirm(`Desactivar a ${est.name_estudiante} ${est.sec_name_estudiante}?`)) return;
    try {
      await deactivateEstudiante(est.id_estudiante);
      await loadEstudiantes();
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
                <Icon icon="solar:user-rounded-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Estudiantes</h1>
                <p className="mt-1 text-muted-foreground">
                  Gestion de expedientes conectada al backend.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Registrar estudiante
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
              {loading ? 'Cargando...' : `${estudiantes.length} estudiante(s) registrado(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && estudiantes.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay estudiantes registrados todavia.
            </div>
          )}

          {estudiantes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-sm font-semibold">Documento</th>
                    <th className="px-6 py-3 text-sm font-semibold">Correo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((est) => (
                    <tr key={est.id_estudiante} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 font-medium">
                        {est.name_estudiante} {est.sec_name_estudiante}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {est.num_documento_estudiante}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {est.usuario.correo_institucional}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            est.usuario.activo
                              ? 'bg-lightsuccess text-success'
                              : 'bg-lighterror text-error'
                          }`}
                        >
                          {est.usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(est)}
                            >
                              Editar
                            </Button>
                            {est.usuario.activo && (
                              <Button
                                variant="ghosterror"
                                size="sm"
                                onClick={() => handleDeactivate(est)}
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
            <DialogTitle>{editing ? 'Editar estudiante' : 'Registrar estudiante'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  className="mt-1"
                  value={form.name_estudiante}
                  onChange={(e) => setField('name_estudiante', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="secName">Apellidos</Label>
                <Input
                  id="secName"
                  className="mt-1"
                  value={form.sec_name_estudiante}
                  onChange={(e) => setField('sec_name_estudiante', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="birth">Fecha de nacimiento</Label>
                <Input
                  id="birth"
                  type="date"
                  className="mt-1"
                  value={form.birthdate_estudiante}
                  onChange={(e) => setField('birthdate_estudiante', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  className="mt-1"
                  value={form.phone_num_estudiante}
                  onChange={(e) => setField('phone_num_estudiante', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="direction">Direccion</Label>
                <Input
                  id="direction"
                  className="mt-1"
                  value={form.direction_estudiante}
                  onChange={(e) => setField('direction_estudiante', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tipoDoc">Tipo de documento</Label>
                <select
                  id="tipoDoc"
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
                <Label htmlFor="numDoc">Numero de documento</Label>
                <Input
                  id="numDoc"
                  className="mt-1"
                  value={form.num_documento_estudiante}
                  onChange={(e) => setField('num_documento_estudiante', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="grupo">Grupo</Label>
                <select
                  id="grupo"
                  className={`${inputClass} mt-1`}
                  value={form.id_grupo}
                  onChange={(e) => setField('id_grupo', e.target.value)}
                >
                  <option value="">Sin grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id_grupo} value={g.id_grupo}>
                      {g.name_grupo}
                    </option>
                  ))}
                </select>
              </div>
              {!editing && (
                <>
                  <div>
                    <Label htmlFor="correo">Correo institucional</Label>
                    <Input
                      id="correo"
                      type="email"
                      className="mt-1"
                      value={form.correo_institucional}
                      onChange={(e) => setField('correo_institucional', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pwd">Contrasena inicial</Label>
                    <Input
                      id="pwd"
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

export default Estudiantes;
