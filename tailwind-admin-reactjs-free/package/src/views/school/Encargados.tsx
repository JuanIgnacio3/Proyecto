import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Banner,
  CheckboxList,
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
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { useModal } from 'src/hooks/useModal';
import { getErrorMessage } from 'src/lib/api';
import { canManagePersonas } from 'src/lib/roles';
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

const Encargados = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const isAdmin = canManagePersonas(user?.rol.name_rol);

  const [encargados, setEncargados] = useState<Encargado[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const { open, setOpen, editing, openCreate, openEdit } = useModal<Encargado>();
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
      setListError(getErrorMessage(err, 'No se pudo cargar la lista.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEncargados();
  }, [loadEncargados]);

  // Catalogos para el modal (tipos de documento + estudiantes de la M2M).
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

  // Sincroniza el formulario y la seleccion de estudiantes al abrir el modal.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name_encargado: editing.name_encargado,
        sec_name_encargado: editing.sec_name_encargado,
        id_tipo_documento: String(editing.id_tipo_documento),
        num_documento_encargado: editing.num_documento_encargado,
        phone_num_encargado: editing.phone_num_encargado ?? '',
        direction_encargado: editing.direction_encargado ?? '',
        parentesco: editing.parentesco,
        correo_institucional: '',
        password: '',
      });
      setEstudiantesIds(editing.estudiantes.map((e) => e.id_estudiante));
    } else {
      setForm({ ...emptyForm });
      setEstudiantesIds([]);
    }
    setFormError(null);
  }, [open, editing]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleEstudiante = (id: number) =>
    setEstudiantesIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

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
      setFormError(getErrorMessage(err, 'No se pudo guardar el encargado.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (enc: Encargado) => {
    if (
      !(await confirm({
        title: `Desactivar a ${enc.name_encargado} ${enc.sec_name_encargado}?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deactivateEncargado(enc.id_encargado);
      await loadEncargados();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo desactivar.'));
    }
  };

  const columns: Column<Encargado>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (enc) => (
        <span className="font-medium">
          {enc.name_encargado} {enc.sec_name_encargado}
        </span>
      ),
    },
    {
      key: 'parentesco',
      header: 'Parentesco',
      render: (enc) => <span className="text-muted-foreground">{enc.parentesco}</span>,
    },
    {
      key: 'estudiantes',
      header: 'Estudiantes',
      render: (enc) => (
        <span className="text-muted-foreground">
          {enc.estudiantes.length === 0
            ? '-'
            : enc.estudiantes.map((e) => `${e.name_estudiante} ${e.sec_name_estudiante}`).join(', ')}
        </span>
      ),
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (enc) => (
        <span className="text-muted-foreground">{enc.usuario.correo_institucional}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (enc) => <StatusBadge active={enc.usuario.activo} />,
    },
  ];
  if (isAdmin) {
    columns.push({
      key: 'acc',
      header: 'Acciones',
      align: 'right',
      render: (enc) => (
        <RowActions
          onEdit={() => openEdit(enc)}
          onDelete={() => handleDeactivate(enc)}
          deleteLabel="Desactivar"
          showDelete={enc.usuario.activo}
        />
      ),
    });
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <PageHeader
        icon="solar:user-hand-up-linear"
        title="Encargados"
        description="Padres, madres o tutores legales asociados a estudiantes."
        action={
          isAdmin && (
            <Button onClick={openCreate} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Registrar encargado
            </Button>
          )
        }
      />

      <div className="col-span-12">
        <SectionCard
          title="Listado"
          subtitle={loading ? 'Cargando...' : `${encargados.length} encargado(s) registrado(s)`}
        >
          {listError ? (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          ) : (
            <CrudTable
              rows={encargados}
              getRowKey={(enc) => enc.id_encargado}
              loading={loading}
              emptyMessage="No hay encargados registrados todavia."
              columns={columns}
            />
          )}
        </SectionCard>
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar encargado' : 'Registrar encargado'}
        error={formError}
        saving={saving}
        onSubmit={handleSubmit}
        className="max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="ename" required>
            <Input
              id="ename"
              value={form.name_encargado}
              onChange={(e) => setField('name_encargado', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Apellidos" htmlFor="esecName" required>
            <Input
              id="esecName"
              value={form.sec_name_encargado}
              onChange={(e) => setField('sec_name_encargado', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Tipo de documento" htmlFor="etipoDoc" required>
            <FormSelect
              id="etipoDoc"
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
          <FormField label="Numero de documento" htmlFor="enumDoc" required>
            <Input
              id="enumDoc"
              value={form.num_documento_encargado}
              onChange={(e) => setField('num_documento_encargado', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Telefono" htmlFor="ephone">
            <Input
              id="ephone"
              value={form.phone_num_encargado}
              onChange={(e) => setField('phone_num_encargado', e.target.value)}
            />
          </FormField>
          <FormField label="Parentesco" htmlFor="eparentesco" required>
            <Input
              id="eparentesco"
              value={form.parentesco}
              onChange={(e) => setField('parentesco', e.target.value)}
              placeholder="Ej. Madre, Padre, Tutor"
              required
            />
          </FormField>
          <FormField label="Direccion" htmlFor="edirection" className="sm:col-span-2">
            <Input
              id="edirection"
              value={form.direction_encargado}
              onChange={(e) => setField('direction_encargado', e.target.value)}
            />
          </FormField>
          {!editing && (
            <>
              <FormField label="Correo institucional" htmlFor="ecorreo" required>
                <Input
                  id="ecorreo"
                  type="email"
                  value={form.correo_institucional}
                  onChange={(e) => setField('correo_institucional', e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Contrasena inicial" htmlFor="epwd" required>
                <Input
                  id="epwd"
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

        <div className="mt-4">
          <Label>Estudiantes a cargo</Label>
          <div className="mt-2">
            <CheckboxList
              items={estudiantes}
              getId={(est) => est.id_estudiante}
              getLabel={(est) => `${est.name_estudiante} ${est.sec_name_estudiante}`}
              selected={estudiantesIds}
              onToggle={toggleEstudiante}
              emptyText="No hay estudiantes disponibles."
              columns={2}
            />
          </div>
        </div>
      </CrudFormDialog>
    </div>
  );
};

export default Encargados;
