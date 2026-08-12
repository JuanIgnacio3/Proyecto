import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Banner,
  CrudFormDialog,
  CrudTable,
  FormField,
  FormSelect,
  PageHeader,
  RowActions,
  SectionCard,
  StatusBadge,
  useConfirm,
  type Column,
} from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { useAuth } from 'src/context/auth-context';
import { useModal } from 'src/hooks/useModal';
import { getErrorMessage } from 'src/lib/api';
import { canManagePersonas } from 'src/lib/roles';
import {
  activateEstudiante,
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

const Estudiantes = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const isAdmin = canManagePersonas(user?.rol.name_rol);

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const { open, setOpen, editing, openCreate, openEdit } = useModal<Estudiante>();
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEstudiantes = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setEstudiantes(await listEstudiantes());
    } catch (err) {
      setListError(getErrorMessage(err, 'No se pudo cargar la lista.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEstudiantes();
  }, [loadEstudiantes]);

  // Catalogos para los selects (solo cuando el modal esta abierto).
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

  // Sincroniza el formulario al abrir el modal (crear o editar).
  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name_estudiante: editing.name_estudiante,
            sec_name_estudiante: editing.sec_name_estudiante,
            birthdate_estudiante: editing.birthdate_estudiante,
            direction_estudiante: editing.direction_estudiante ?? '',
            phone_num_estudiante: editing.phone_num_estudiante ?? '',
            id_tipo_documento: String(editing.id_tipo_documento),
            num_documento_estudiante: editing.num_documento_estudiante,
            id_grupo: editing.id_grupo ? String(editing.id_grupo) : '',
            correo_institucional: '',
            password: '',
          }
        : { ...emptyForm },
    );
    setFormError(null);
  }, [open, editing]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      setFormError(getErrorMessage(err, 'No se pudo guardar el estudiante.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (est: Estudiante) => {
    if (
      !(await confirm({
        title: `Desactivar a ${est.name_estudiante} ${est.sec_name_estudiante}?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deactivateEstudiante(est.id_estudiante);
      await loadEstudiantes();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo desactivar.'));
    }
  };

  const handleActivate = async (est: Estudiante) => {
    try {
      await activateEstudiante(est.id_estudiante);
      await loadEstudiantes();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo activar.'));
    }
  };

  const columns: Column<Estudiante>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (est) => (
        <span className="font-medium">
          {est.name_estudiante} {est.sec_name_estudiante}
        </span>
      ),
    },
    {
      key: 'documento',
      header: 'Documento',
      render: (est) => <span className="text-muted-foreground">{est.num_documento_estudiante}</span>,
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (est) => (
        <span className="text-muted-foreground">{est.usuario.correo_institucional}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (est) => <StatusBadge active={est.usuario.activo} />,
    },
  ];
  if (isAdmin) {
    columns.push({
      key: 'acc',
      header: 'Acciones',
      align: 'right',
      render: (est) => (
        <RowActions
          onEdit={() => openEdit(est)}
          onDelete={() => handleDeactivate(est)}
          deleteLabel="Desactivar"
          showDelete={est.usuario.activo}
          onActivate={() => handleActivate(est)}
          showActivate={!est.usuario.activo}
        />
      ),
    });
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <PageHeader
        icon="solar:user-rounded-linear"
        title="Estudiantes"
        description="Gestion de expedientes conectada al backend."
        action={
          isAdmin && (
            <Button onClick={openCreate} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Registrar estudiante
            </Button>
          )
        }
      />

      <div className="col-span-12">
        <SectionCard
          title="Listado"
          subtitle={loading ? 'Cargando...' : `${estudiantes.length} estudiante(s) registrado(s)`}
        >
          {listError ? (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          ) : (
            <CrudTable
              rows={estudiantes}
              getRowKey={(est) => est.id_estudiante}
              loading={loading}
              emptyMessage="No hay estudiantes registrados todavia."
              columns={columns}
            />
          )}
        </SectionCard>
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar estudiante' : 'Registrar estudiante'}
        error={formError}
        saving={saving}
        onSubmit={handleSubmit}
        className="max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="name" required>
            <Input
              id="name"
              value={form.name_estudiante}
              onChange={(e) => setField('name_estudiante', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Apellidos" htmlFor="secName" required>
            <Input
              id="secName"
              value={form.sec_name_estudiante}
              onChange={(e) => setField('sec_name_estudiante', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Fecha de nacimiento" htmlFor="birth" required>
            <Input
              id="birth"
              type="date"
              value={form.birthdate_estudiante}
              onChange={(e) => setField('birthdate_estudiante', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Telefono" htmlFor="phone">
            <Input
              id="phone"
              value={form.phone_num_estudiante}
              onChange={(e) => setField('phone_num_estudiante', e.target.value)}
            />
          </FormField>
          <FormField label="Direccion" htmlFor="direction" className="sm:col-span-2">
            <Input
              id="direction"
              value={form.direction_estudiante}
              onChange={(e) => setField('direction_estudiante', e.target.value)}
            />
          </FormField>
          <FormField label="Tipo de documento" htmlFor="tipoDoc" required>
            <FormSelect
              id="tipoDoc"
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
            </FormSelect>
          </FormField>
          <FormField label="Numero de documento" htmlFor="numDoc" required>
            <Input
              id="numDoc"
              value={form.num_documento_estudiante}
              onChange={(e) => setField('num_documento_estudiante', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Grupo" htmlFor="grupo">
            <FormSelect
              id="grupo"
              value={form.id_grupo}
              onChange={(e) => setField('id_grupo', e.target.value)}
            >
              <option value="">Sin grupo</option>
              {grupos.map((g) => (
                <option key={g.id_grupo} value={g.id_grupo}>
                  {g.name_grupo}
                </option>
              ))}
            </FormSelect>
          </FormField>
          {!editing && (
            <>
              <FormField label="Correo institucional" htmlFor="correo" required>
                <Input
                  id="correo"
                  type="email"
                  value={form.correo_institucional}
                  onChange={(e) => setField('correo_institucional', e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Contrasena inicial" htmlFor="pwd" required>
                <Input
                  id="pwd"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  minLength={8}
                  required
                />
              </FormField>
            </>
          )}
        </div>
      </CrudFormDialog>
    </div>
  );
};

export default Estudiantes;
