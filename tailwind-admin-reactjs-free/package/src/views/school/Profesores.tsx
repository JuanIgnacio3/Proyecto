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
  SearchInput,
  SectionCard,
  StatusBadge,
  useConfirm,
  PasswordInput,
  type Column,
} from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { useAuth } from 'src/context/auth-context';
import { useModal } from 'src/hooks/useModal';
import { getErrorMessage } from 'src/lib/api';
import { matchText } from 'src/lib/search';
import { listTiposDocumento } from 'src/lib/estudiantes';
import {
  activateProfesor,
  createProfesor,
  deactivateProfesor,
  listProfesores,
  updateProfesor,
} from 'src/lib/profesores';
import type { TipoDocumento } from 'src/types/estudiante';
import type { Profesor } from 'src/types/profesor';

const emptyForm = {
  name_profesor: '',
  sec_name_profesor: '',
  birthdate_profesor: '',
  direction_profesor: '',
  phone_num_profesor: '',
  id_tipo_documento: '',
  num_documento_profesor: '',
  correo_institucional: '',
  password: '',
};

const Profesores = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { open, setOpen, editing, openCreate, openEdit } = useModal<Profesor>();
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProfesores = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setProfesores(await listProfesores());
    } catch (err) {
      setListError(getErrorMessage(err, 'No se pudo cargar la lista.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfesores();
  }, [loadProfesores]);

  // Catalogo de tipos de documento (solo cuando el modal esta abierto).
  useEffect(() => {
    if (!open) return;
    listTiposDocumento()
      .then(setTipos)
      .catch(() => {
        /* el select quedara vacio; el backend valida igual */
      });
  }, [open]);

  // Sincroniza el formulario al abrir el modal (crear o editar).
  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? {
            name_profesor: editing.name_profesor,
            sec_name_profesor: editing.sec_name_profesor,
            birthdate_profesor: editing.birthdate_profesor,
            direction_profesor: editing.direction_profesor ?? '',
            phone_num_profesor: editing.phone_num_profesor ?? '',
            id_tipo_documento: String(editing.id_tipo_documento),
            num_documento_profesor: editing.num_documento_profesor,
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
        name_profesor: form.name_profesor,
        sec_name_profesor: form.sec_name_profesor,
        birthdate_profesor: form.birthdate_profesor,
        direction_profesor: form.direction_profesor || null,
        phone_num_profesor: form.phone_num_profesor || null,
        id_tipo_documento: Number(form.id_tipo_documento),
        num_documento_profesor: form.num_documento_profesor,
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
      setFormError(getErrorMessage(err, 'No se pudo guardar el profesor.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (prof: Profesor) => {
    if (
      !(await confirm({
        title: `Desactivar a ${prof.name_profesor} ${prof.sec_name_profesor}?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deactivateProfesor(prof.id_profesor);
      await loadProfesores();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo desactivar.'));
    }
  };

  const handleActivate = async (prof: Profesor) => {
    try {
      await activateProfesor(prof.id_profesor);
      await loadProfesores();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo activar.'));
    }
  };

  const profesoresFiltrados = profesores.filter((prof) =>
    matchText(
      query,
      prof.name_profesor,
      prof.sec_name_profesor,
      prof.num_documento_profesor,
      prof.usuario.correo_institucional,
    ),
  );

  const columns: Column<Profesor>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (prof) => (
        <span className="font-medium">
          {prof.name_profesor} {prof.sec_name_profesor}
        </span>
      ),
    },
    {
      key: 'documento',
      header: 'Documento',
      render: (prof) => <span className="text-muted-foreground">{prof.num_documento_profesor}</span>,
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (prof) => (
        <span className="text-muted-foreground">{prof.usuario.correo_institucional}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (prof) => <StatusBadge active={prof.usuario.activo} />,
    },
  ];
  if (isAdmin) {
    columns.push({
      key: 'acc',
      header: 'Acciones',
      align: 'right',
      render: (prof) => (
        <RowActions
          onEdit={() => openEdit(prof)}
          onDelete={() => handleDeactivate(prof)}
          deleteLabel="Desactivar"
          showDelete={prof.usuario.activo}
          onActivate={() => handleActivate(prof)}
          showActivate={!prof.usuario.activo}
        />
      ),
    });
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <PageHeader
        icon="solar:square-academic-cap-linear"
        title="Profesores"
        description="Administracion del personal docente conectada al backend."
        action={
          isAdmin && (
            <Button onClick={openCreate} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Registrar profesor
            </Button>
          )
        }
      />

      <div className="col-span-12">
        <SectionCard
          title="Listado"
          subtitle={loading ? 'Cargando...' : `${profesoresFiltrados.length} profesor(es)`}
          actions={
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por nombre, documento, correo..."
            />
          }
        >
          {listError ? (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          ) : (
            <CrudTable
              rows={profesoresFiltrados}
              getRowKey={(prof) => prof.id_profesor}
              loading={loading}
              emptyMessage="No hay profesores que coincidan con la busqueda."
              columns={columns}
            />
          )}
        </SectionCard>
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar profesor' : 'Registrar profesor'}
        error={formError}
        saving={saving}
        onSubmit={handleSubmit}
        className="max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="pname" required>
            <Input
              id="pname"
              value={form.name_profesor}
              onChange={(e) => setField('name_profesor', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Apellidos" htmlFor="psecName" required>
            <Input
              id="psecName"
              value={form.sec_name_profesor}
              onChange={(e) => setField('sec_name_profesor', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Fecha de nacimiento" htmlFor="pbirth" required>
            <Input
              id="pbirth"
              type="date"
              value={form.birthdate_profesor}
              onChange={(e) => setField('birthdate_profesor', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Telefono" htmlFor="pphone">
            <Input
              id="pphone"
              value={form.phone_num_profesor}
              onChange={(e) => setField('phone_num_profesor', e.target.value)}
            />
          </FormField>
          <FormField label="Direccion" htmlFor="pdirection" className="sm:col-span-2">
            <Input
              id="pdirection"
              value={form.direction_profesor}
              onChange={(e) => setField('direction_profesor', e.target.value)}
            />
          </FormField>
          <FormField label="Tipo de documento" htmlFor="ptipoDoc" required>
            <FormSelect
              id="ptipoDoc"
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
          <FormField label="Numero de documento" htmlFor="pnumDoc" required>
            <Input
              id="pnumDoc"
              value={form.num_documento_profesor}
              onChange={(e) => setField('num_documento_profesor', e.target.value)}
              required
            />
          </FormField>
          {!editing && (
            <>
              <FormField label="Correo institucional" htmlFor="pcorreo" required>
                <Input
                  id="pcorreo"
                  type="email"
                  value={form.correo_institucional}
                  onChange={(e) => setField('correo_institucional', e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Contrasena inicial" htmlFor="ppwd" required>
                <PasswordInput
                  id="ppwd"
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

export default Profesores;
