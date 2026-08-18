import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import CardBox from 'src/components/shared/CardBox';
import {
  FormSelect,
  Pagination,
  SearchInput,
  StatusBadge,
  useConfirm,
} from 'src/components/institutional';
import { usePagination } from 'src/hooks/usePagination';
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
import { matchText } from 'src/lib/search';
import {
  activateAsignacion,
  createAsignacion,
  deleteAsignacion,
  listAsignaciones,
  setAsistenciaAsignacion,
} from 'src/lib/asignaciones';
import { listAsignaturas } from 'src/lib/asignaturas';
import { activateGrupo, createGrupo, deleteGrupo, listGrupos, updateGrupo } from 'src/lib/grupos';
import { listEstudiantes } from 'src/lib/estudiantes';
import { listProfesores } from 'src/lib/profesores';
import type { Asignacion } from 'src/types/asignacion';
import type { Asignatura } from 'src/types/asignatura';
import type { Estudiante } from 'src/types/estudiante';
import type { Grupo } from 'src/types/grupo';
import type { Profesor } from 'src/types/profesor';

const inputClass =
  'flex h-10 w-full border border-ld rounded-lg bg-transparent px-3 py-2 text-sm text-ld focus-visible:border-primary focus-visible:outline-0';

// Grados de un colegio tecnico (setimo a duodecimo).
const GRADOS = ['7mo', '8vo', '9no', '10mo', '11mo', '12vo'];

const Grupos = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [filtroGrado, setFiltroGrado] = useState('');
  const [query, setQuery] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Grupo | null>(null);
  const [nombre, setNombre] = useState('');
  const [grado, setGrado] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal de profesores y materias (asignaciones) de un grupo.
  const [asigOpen, setAsigOpen] = useState(false);
  const [asigGrupo, setAsigGrupo] = useState<Grupo | null>(null);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [asigProfesor, setAsigProfesor] = useState('');
  const [asigMateria, setAsigMateria] = useState('');
  const [asigAsistencia, setAsigAsistencia] = useState('0');
  const [asigError, setAsigError] = useState<string | null>(null);
  const [asigLoading, setAsigLoading] = useState(false);
  const [asigSaving, setAsigSaving] = useState(false);

  // Modal de estudiantes del grupo (solo lectura; se asignan al registrar estudiante).
  const [estOpen, setEstOpen] = useState(false);
  const [estGrupo, setEstGrupo] = useState<Grupo | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estLoading, setEstLoading] = useState(false);
  const [estError, setEstError] = useState<string | null>(null);

  const loadGrupos = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setGrupos(await listGrupos());
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : 'No se pudo cargar la lista.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  const openCreate = () => {
    setEditing(null);
    setNombre('');
    setGrado('');
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (grupo: Grupo) => {
    setEditing(grupo);
    setNombre(grupo.name_grupo);
    setGrado(grupo.grado ?? '');
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      const payload = { name_grupo: nombre, grado };
      if (editing) {
        await updateGrupo(editing.id_grupo, payload);
      } else {
        await createGrupo(payload);
      }
      setOpen(false);
      await loadGrupos();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar el grupo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (grupo: Grupo) => {
    if (
      !(await confirm({
        title: `Desactivar el grupo "${grupo.name_grupo}"?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deleteGrupo(grupo.id_grupo);
      await loadGrupos();
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo desactivar.');
    }
  };

  const handleActivate = async (grupo: Grupo) => {
    try {
      await activateGrupo(grupo.id_grupo);
      await loadGrupos();
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo activar.');
    }
  };

  const loadAsignaciones = useCallback(async (idGrupo: number) => {
    setAsigLoading(true);
    try {
      setAsignaciones(await listAsignaciones(idGrupo));
    } catch (err) {
      setAsigError(err instanceof ApiError ? err.message : 'No se pudieron cargar las asignaciones.');
    } finally {
      setAsigLoading(false);
    }
  }, []);

  const openAsignaciones = async (grupo: Grupo) => {
    setAsigGrupo(grupo);
    setAsigProfesor('');
    setAsigMateria('');
    setAsigAsistencia('0');
    setAsigError(null);
    setAsigOpen(true);
    await loadAsignaciones(grupo.id_grupo);
    // Catalogos para los selects del formulario.
    Promise.all([listProfesores(true), listAsignaturas(true)])
      .then(([p, a]) => {
        setProfesores(p);
        setAsignaturas(a);
      })
      .catch(() => {
        /* los selects quedaran vacios; el backend valida igual */
      });
  };

  const handleAddAsignacion = async (e: FormEvent) => {
    e.preventDefault();
    if (!asigGrupo) return;
    setAsigError(null);
    setAsigSaving(true);
    try {
      await createAsignacion({
        id_grupo: asigGrupo.id_grupo,
        id_profesor: Number(asigProfesor),
        id_asignatura: Number(asigMateria),
        porcentaje_asistencia: Number(asigAsistencia) || 0,
      });
      setAsigProfesor('');
      setAsigMateria('');
      setAsigAsistencia('0');
      await loadAsignaciones(asigGrupo.id_grupo);
    } catch (err) {
      setAsigError(err instanceof ApiError ? err.message : 'No se pudo agregar la asignacion.');
    } finally {
      setAsigSaving(false);
    }
  };

  const handleRemoveAsignacion = async (a: Asignacion) => {
    if (
      !(await confirm({
        title: `Quitar a ${a.profesor.name_profesor} ${a.profesor.sec_name_profesor} de ${a.asignatura.name_asignatura}?`,
        confirmLabel: 'Quitar',
        destructive: true,
      }))
    )
      return;
    try {
      await deleteAsignacion(a.id_profesor_asignatura_grupo);
      if (asigGrupo) await loadAsignaciones(asigGrupo.id_grupo);
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo quitar.');
    }
  };

  const handleReactivarAsignacion = async (a: Asignacion) => {
    try {
      await activateAsignacion(a.id_profesor_asignatura_grupo);
      if (asigGrupo) await loadAsignaciones(asigGrupo.id_grupo);
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo reactivar.');
    }
  };

  const handleSetAsistencia = async (a: Asignacion, value: string) => {
    const pct = Number(value);
    if (Number.isNaN(pct) || pct < 0 || pct > 100 || pct === a.porcentaje_asistencia) return;
    try {
      await setAsistenciaAsignacion(a.id_profesor_asignatura_grupo, pct);
      if (asigGrupo) await loadAsignaciones(asigGrupo.id_grupo);
    } catch (err) {
      await notify(err instanceof ApiError ? err.message : 'No se pudo actualizar el % de asistencia.');
    }
  };

  const openEstudiantes = async (grupo: Grupo) => {
    setEstGrupo(grupo);
    setEstError(null);
    setEstudiantes([]);
    setEstOpen(true);
    setEstLoading(true);
    try {
      setEstudiantes(await listEstudiantes(grupo.id_grupo, true));
    } catch (err) {
      setEstError(err instanceof ApiError ? err.message : 'No se pudieron cargar los estudiantes.');
    } finally {
      setEstLoading(false);
    }
  };

  const gruposFiltrados = grupos.filter(
    (g) => (!filtroGrado || g.grado === filtroGrado) && matchText(query, g.name_grupo, g.grado),
  );
  const paginacion = usePagination(gruposFiltrados, 10);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <CardBox className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <Icon icon="solar:layers-linear" width={24} height={24} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Grupos y secciones</h1>
                <p className="mt-1 text-muted-foreground">
                  Organizacion de grupos por materia, conectada al backend.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button onClick={openCreate} className="md:w-auto w-full">
                <Icon icon="solar:add-circle-linear" width={18} height={18} />
                Crear grupo
              </Button>
            )}
          </div>
        </CardBox>
      </div>

      <div className="col-span-12">
        <CardBox className="p-0 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-ld px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Listado</h2>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Cargando...' : `${gruposFiltrados.length} grupo(s)`}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={query} onChange={setQuery} placeholder="Buscar grupo..." />
              <div className="flex items-center gap-2">
                <Label htmlFor="fgrado" className="text-sm text-muted-foreground">
                  Grado
                </Label>
                <FormSelect
                  id="fgrado"
                  className={`${inputClass} w-auto`}
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                >
                  <option value="">Todos</option>
                  {GRADOS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </FormSelect>
              </div>
            </div>
          </div>

          {listError && (
            <div className="m-6 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
              {listError}
            </div>
          )}

          {!loading && !listError && gruposFiltrados.length === 0 && (
            <div className="px-6 py-10 text-center text-muted-foreground">
              {grupos.length === 0
                ? 'No hay grupos registrados todavia.'
                : 'Ningun grupo coincide con el grado seleccionado.'}
            </div>
          )}

          {gruposFiltrados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-ld bg-muted/40">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">#</th>
                    <th className="px-6 py-3 text-sm font-semibold">Grupo</th>
                    <th className="px-6 py-3 text-sm font-semibold">Grado</th>
                    <th className="px-6 py-3 text-sm font-semibold">Estado</th>
                    {isAdmin && <th className="px-6 py-3 text-sm font-semibold text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginacion.pageItems.map((grupo) => (
                    <tr key={grupo.id_grupo} className="border-b border-ld last:border-0">
                      <td className="px-6 py-4 text-muted-foreground">{grupo.id_grupo}</td>
                      <td className="px-6 py-4 font-medium">{grupo.name_grupo}</td>
                      <td className="px-6 py-4 text-muted-foreground">{grupo.grado ?? '-'}</td>
                      <td className="px-6 py-4">
                        <StatusBadge active={grupo.activo} />
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="lightprimary"
                              size="sm"
                              onClick={() => openAsignaciones(grupo)}
                            >
                              Profesores
                            </Button>
                            <Button
                              variant="lightprimary"
                              size="sm"
                              onClick={() => openEstudiantes(grupo)}
                            >
                              Estudiantes
                            </Button>
                            <Button
                              variant="ghostprimary"
                              size="sm"
                              onClick={() => openEdit(grupo)}
                            >
                              Editar
                            </Button>
                            {grupo.activo ? (
                              <Button
                                variant="ghosterror"
                                size="sm"
                                onClick={() => handleDeactivate(grupo)}
                              >
                                Desactivar
                              </Button>
                            ) : (
                              <Button
                                variant="ghostprimary"
                                size="sm"
                                onClick={() => handleActivate(grupo)}
                              >
                                Activar
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
          {gruposFiltrados.length > 0 && (
            <Pagination
              page={paginacion.page}
              pageCount={paginacion.pageCount}
              onPageChange={paginacion.setPage}
              rangeStart={paginacion.rangeStart}
              rangeEnd={paginacion.rangeEnd}
              total={paginacion.total}
            />
          )}
        </CardBox>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar grupo' : 'Crear grupo'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2">
            {formError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}

            <div className="mb-4">
              <Label htmlFor="gnombre">Nombre del grupo</Label>
              <Input
                id="gnombre"
                className="mt-1"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. 7-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="ggrado">Grado</Label>
              <FormSelect
                id="ggrado"
                className={`${inputClass} mt-1`}
                value={grado}
                onChange={(e) => setGrado(e.target.value)}
                required
              >
                <option value="">Seleccione...</option>
                {GRADOS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </FormSelect>
              <p className="mt-1 text-xs text-muted-foreground">
                Las materias se asignan por profesor con el boton "Profesores".
              </p>
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

      <Dialog open={asigOpen} onOpenChange={setAsigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Profesores y materias{asigGrupo ? ` — ${asigGrupo.name_grupo}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {asigError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {asigError}
              </div>
            )}

            {isAdmin && (
              <form onSubmit={handleAddAsignacion} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                <div>
                  <Label htmlFor="asigProf">Profesor</Label>
                  <FormSelect
                    id="asigProf"
                    className={`${inputClass} mt-1`}
                    value={asigProfesor}
                    onChange={(e) => setAsigProfesor(e.target.value)}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {profesores.map((p) => (
                      <option key={p.id_profesor} value={p.id_profesor}>
                        {p.name_profesor} {p.sec_name_profesor}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div>
                  <Label htmlFor="asigMat">Materia</Label>
                  <FormSelect
                    id="asigMat"
                    className={`${inputClass} mt-1`}
                    value={asigMateria}
                    onChange={(e) => setAsigMateria(e.target.value)}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {asignaturas.map((a) => (
                      <option key={a.id_asignatura} value={a.id_asignatura}>
                        {a.name_asignatura}
                      </option>
                    ))}
                  </FormSelect>
                </div>
                <div>
                  <Label htmlFor="asigAsist">% Asist.</Label>
                  <Input
                    id="asigAsist"
                    type="number"
                    min={0}
                    max={100}
                    className="mt-1 sm:w-20"
                    value={asigAsistencia}
                    onChange={(e) => setAsigAsistencia(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" disabled={asigSaving} className="w-full sm:w-auto">
                    {asigSaving ? 'Agregando...' : 'Agregar'}
                  </Button>
                </div>
              </form>
            )}

            {asigLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : asignaciones.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Este grupo no tiene profesores asignados todavia.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-ld">
                <table className="w-full text-left">
                  <thead className="border-b border-ld bg-muted/40">
                    <tr>
                      <th className="px-4 py-2 text-sm font-semibold">Profesor</th>
                      <th className="px-4 py-2 text-sm font-semibold">Materia</th>
                      <th className="px-4 py-2 text-sm font-semibold">% Asist.</th>
                      <th className="px-4 py-2 text-sm font-semibold">Estado</th>
                      {isAdmin && <th className="px-4 py-2 text-sm font-semibold text-right">Accion</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.map((a) => (
                      <tr
                        key={a.id_profesor_asignatura_grupo}
                        className="border-b border-ld last:border-0"
                      >
                        <td className="px-4 py-2">
                          {a.profesor.name_profesor} {a.profesor.sec_name_profesor}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {a.asignatura.name_asignatura}
                        </td>
                        <td className="px-4 py-2">
                          {isAdmin ? (
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              defaultValue={a.porcentaje_asistencia}
                              onBlur={(e) => handleSetAsistencia(a, e.target.value)}
                              className="h-8 w-20"
                            />
                          ) : (
                            <span className="text-muted-foreground">{a.porcentaje_asistencia}%</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge active={a.activo} />
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-2 text-right">
                            {a.activo ? (
                              <Button
                                variant="ghosterror"
                                size="sm"
                                onClick={() => handleRemoveAsignacion(a)}
                              >
                                Quitar
                              </Button>
                            ) : (
                              <Button
                                variant="ghostprimary"
                                size="sm"
                                onClick={() => handleReactivarAsignacion(a)}
                              >
                                Reactivar
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setAsigOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={estOpen} onOpenChange={setEstOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Estudiantes{estGrupo ? ` — ${estGrupo.name_grupo}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {estError && (
              <div className="mb-4 rounded-md bg-lighterror px-4 py-3 text-sm text-error">
                {estError}
              </div>
            )}

            <p className="mb-3 text-xs text-muted-foreground">
              Los estudiantes se asignan al grupo al registrarlos o editarlos.
            </p>

            {estLoading ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : estudiantes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Este grupo no tiene estudiantes asignados.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-ld">
                <table className="w-full text-left">
                  <thead className="border-b border-ld bg-muted/40">
                    <tr>
                      <th className="px-4 py-2 text-sm font-semibold">Estudiante</th>
                      <th className="px-4 py-2 text-sm font-semibold">Documento</th>
                      <th className="px-4 py-2 text-sm font-semibold">Correo</th>
                      <th className="px-4 py-2 text-sm font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map((est) => (
                      <tr key={est.id_estudiante} className="border-b border-ld last:border-0">
                        <td className="px-4 py-2">
                          {est.name_estudiante} {est.sec_name_estudiante}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {est.num_documento_estudiante}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {est.usuario.correo_institucional}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge active={est.usuario.activo} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button type="button" variant="outline" onClick={() => setEstOpen(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Grupos;
