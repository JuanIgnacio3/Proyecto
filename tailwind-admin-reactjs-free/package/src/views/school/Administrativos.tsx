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
import {
  activateAdministrativo,
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

const Administrativos = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [administrativos, setAdministrativos] = useState<Administrativo[]>([]);
  const [tipos, setTipos] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const { open, setOpen, editing, openCreate, openEdit } = useModal<Administrativo>();
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAdministrativos = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setAdministrativos(await listAdministrativos());
    } catch (err) {
      setListError(getErrorMessage(err, 'No se pudo cargar la lista.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdministrativos();
  }, [loadAdministrativos]);

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
            name_administrativo: editing.name_administrativo,
            sec_name_administrativo: editing.sec_name_administrativo,
            id_tipo_documento: String(editing.id_tipo_documento),
            num_documento_administrativo: editing.num_documento_administrativo,
            phone_num_administrativo: editing.phone_num_administrativo ?? '',
            direction_administrativo: editing.direction_administrativo ?? '',
            cargo: editing.cargo,
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
      setFormError(getErrorMessage(err, 'No se pudo guardar el administrativo.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (adm: Administrativo) => {
    if (
      !(await confirm({
        title: `Desactivar a ${adm.name_administrativo} ${adm.sec_name_administrativo}?`,
        confirmLabel: 'Desactivar',
        destructive: true,
      }))
    )
      return;
    try {
      await deactivateAdministrativo(adm.id_administrativo);
      await loadAdministrativos();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo desactivar.'));
    }
  };

  const handleActivate = async (adm: Administrativo) => {
    try {
      await activateAdministrativo(adm.id_administrativo);
      await loadAdministrativos();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo activar.'));
    }
  };

  const columns: Column<Administrativo>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (adm) => (
        <span className="font-medium">
          {adm.name_administrativo} {adm.sec_name_administrativo}
        </span>
      ),
    },
    {
      key: 'cargo',
      header: 'Cargo',
      render: (adm) => <span className="text-muted-foreground">{adm.cargo}</span>,
    },
    {
      key: 'documento',
      header: 'Documento',
      render: (adm) => (
        <span className="text-muted-foreground">{adm.num_documento_administrativo}</span>
      ),
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (adm) => (
        <span className="text-muted-foreground">{adm.usuario.correo_institucional}</span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (adm) => <StatusBadge active={adm.usuario.activo} />,
    },
  ];
  if (isAdmin) {
    columns.push({
      key: 'acc',
      header: 'Acciones',
      align: 'right',
      render: (adm) => (
        <RowActions
          onEdit={() => openEdit(adm)}
          onDelete={() => handleDeactivate(adm)}
          deleteLabel="Desactivar"
          showDelete={adm.usuario.activo}
          onActivate={() => handleActivate(adm)}
          showActivate={!adm.usuario.activo}
        />
      ),
    });
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <PageHeader
        icon="solar:users-group-rounded-linear"
        title="Administrativos"
        description="Personal administrativo con acceso limitado al sistema."
        action={
          isAdmin && (
            <Button onClick={openCreate} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Registrar administrativo
            </Button>
          )
        }
      />

      <div className="col-span-12">
        <SectionCard
          title="Listado"
          subtitle={
            loading ? 'Cargando...' : `${administrativos.length} administrativo(s) registrado(s)`
          }
        >
          {listError ? (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          ) : (
            <CrudTable
              rows={administrativos}
              getRowKey={(adm) => adm.id_administrativo}
              loading={loading}
              emptyMessage="No hay administrativos registrados todavia."
              columns={columns}
            />
          )}
        </SectionCard>
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar administrativo' : 'Registrar administrativo'}
        error={formError}
        saving={saving}
        onSubmit={handleSubmit}
        className="max-w-2xl"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="aname" required>
            <Input
              id="aname"
              value={form.name_administrativo}
              onChange={(e) => setField('name_administrativo', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Apellidos" htmlFor="asecName" required>
            <Input
              id="asecName"
              value={form.sec_name_administrativo}
              onChange={(e) => setField('sec_name_administrativo', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Cargo" htmlFor="acargo" required>
            <Input
              id="acargo"
              value={form.cargo}
              onChange={(e) => setField('cargo', e.target.value)}
              placeholder="Ej. Secretaria, Orientador"
              required
            />
          </FormField>
          <FormField label="Telefono" htmlFor="aphone">
            <Input
              id="aphone"
              value={form.phone_num_administrativo}
              onChange={(e) => setField('phone_num_administrativo', e.target.value)}
            />
          </FormField>
          <FormField label="Tipo de documento" htmlFor="atipoDoc" required>
            <FormSelect
              id="atipoDoc"
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
          <FormField label="Numero de documento" htmlFor="anumDoc" required>
            <Input
              id="anumDoc"
              value={form.num_documento_administrativo}
              onChange={(e) => setField('num_documento_administrativo', e.target.value)}
              required
            />
          </FormField>
          <FormField label="Direccion" htmlFor="adirection" className="sm:col-span-2">
            <Input
              id="adirection"
              value={form.direction_administrativo}
              onChange={(e) => setField('direction_administrativo', e.target.value)}
            />
          </FormField>
          {!editing && (
            <>
              <FormField label="Correo institucional" htmlFor="acorreo" required>
                <Input
                  id="acorreo"
                  type="email"
                  value={form.correo_institucional}
                  onChange={(e) => setField('correo_institucional', e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Contrasena inicial" htmlFor="apwd" required>
                <Input
                  id="apwd"
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

export default Administrativos;
