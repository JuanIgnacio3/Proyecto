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
import { listGrupos, listTiposDocumento } from 'src/lib/estudiantes';
import {
  createProfesor,
  deactivateProfesor,
  listProfesores,
  updateProfesor,
} from 'src/lib/profesores';
import type { Grupo, TipoDocumento } from 'src/types/estudiante';
import type { Profesor } from 'src/types/profesor';

const emptyForm = {
  name_profesor: '',
  sec_name_profesor: '',
  birthdate_profesor: '',
  direction_profesor: '',
  phone_num_profesor: '',
  id_tipo_documento: '',
  num_documento_profesor: '',
  id_grupo: '',
  correo_institucional: '',
  password: '',
};

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

const Profesores = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Profesor | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProfesores = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setProfesores(await listProfesores());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfesores();
  }, [loadProfesores]);

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

  const openEdit = (prof: Profesor) => {
    setEditing(prof);
    setForm({
      name_profesor: prof.name_profesor,
      sec_name_profesor: prof.sec_name_profesor,
      birthdate_profesor: prof.birthdate_profesor,
      direction_profesor: prof.direction_profesor ?? '',
      phone_num_profesor: prof.phone_num_profesor ?? '',
      id_tipo_documento: String(prof.id_tipo_documento),
      num_documento_profesor: prof.num_documento_profesor,
      id_grupo: prof.id_grupo ? String(prof.id_grupo) : '',
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
        name_profesor: form.name_profesor,
        sec_name_profesor: form.sec_name_profesor,
        birthdate_profesor: form.birthdate_profesor,
        direction_profesor: form.direction_profesor || null,
        phone_num_profesor: form.phone_num_profesor || null,
        id_tipo_documento: Number(form.id_tipo_documento),
        num_documento_profesor: form.num_documento_profesor,
        id_grupo: form.id_grupo ? Number(form.id_grupo) : null,
      };
      if (editing) {
        await updateProfesor(editing.id_profesor, base);
      } else {
        await createProfesor({
          ...base,
          correo_institucional: form.correo_institucional,
          password: form.password,
        });
      }
      setOpen(false);
      await loadProfesores();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el profesor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (prof: Profesor) => {
    if (!confirm(`Desactivar a ${prof.name_profesor} ${prof.sec_name_profesor}?`)) return;
    try {
      await deactivateProfesor(prof.id_profesor);
      await loadProfesores();
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
                <Icon icon="solar:square-academic-cap-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Profesores</h1>
                <p className="mt-1 text-muted-foreground">
                  Administracion del personal docente conectada al backend.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Registrar profesor
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
              {loading ? 'Cargando...' : `${profesores.length} profesor(es) registrado(s)`}
            </p>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && profesores.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              No hay profesores registrados todavia.
            </div>
          )}

          {profesores.length > 0 && (
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
                  {profesores.map((prof) => (
                    <tr key={prof.id_profesor} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 font-medium">
                        {prof.name_profesor} {prof.sec_name_profesor}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {prof.num_documento_profesor}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {prof.usuario.correo_institucional}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            prof.usuario.activo
                              ? 'bg-lightsuccess text-success'
                              : 'bg-lighterror text-error'
                          }`}
                        >
                          {prof.usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(prof)}
                            >
                              Editar
                            </Button>
                            {prof.usuario.activo && (
                              <Button
                                variant="ghosterror"
                                size="sm"
                                onClick={() => handleDeactivate(prof)}
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
            <DialogTitle>{editing ? 'Editar profesor' : 'Registrar profesor'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pname">Nombre</Label>
                <Input
                  id="pname"
                  className="mt-1"
                  value={form.name_profesor}
                  onChange={(e) => setField('name_profesor', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="psecName">Apellidos</Label>
                <Input
                  id="psecName"
                  className="mt-1"
                  value={form.sec_name_profesor}
                  onChange={(e) => setField('sec_name_profesor', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pbirth">Fecha de nacimiento</Label>
                <Input
                  id="pbirth"
                  type="date"
                  className="mt-1"
                  value={form.birthdate_profesor}
                  onChange={(e) => setField('birthdate_profesor', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pphone">Telefono</Label>
                <Input
                  id="pphone"
                  className="mt-1"
                  value={form.phone_num_profesor}
                  onChange={(e) => setField('phone_num_profesor', e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="pdirection">Direccion</Label>
                <Input
                  id="pdirection"
                  className="mt-1"
                  value={form.direction_profesor}
                  onChange={(e) => setField('direction_profesor', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ptipoDoc">Tipo de documento</Label>
                <select
                  id="ptipoDoc"
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
                <Label htmlFor="pnumDoc">Numero de documento</Label>
                <Input
                  id="pnumDoc"
                  className="mt-1"
                  value={form.num_documento_profesor}
                  onChange={(e) => setField('num_documento_profesor', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pgrupo">Grupo</Label>
                <select
                  id="pgrupo"
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
                    <Label htmlFor="pcorreo">Correo institucional</Label>
                    <Input
                      id="pcorreo"
                      type="email"
                      className="mt-1"
                      value={form.correo_institucional}
                      onChange={(e) => setField('correo_institucional', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ppwd">Contrasena inicial</Label>
                    <Input
                      id="ppwd"
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

export default Profesores;
