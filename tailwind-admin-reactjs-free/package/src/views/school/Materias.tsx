import { Icon } from '@iconify/react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  Banner,
  CrudFormDialog,
  CrudTable,
  FormField,
  PageHeader,
  RowActions,
  SectionCard,
  useConfirm,
  type Column,
} from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { useAuth } from 'src/context/auth-context';
import { useModal } from 'src/hooks/useModal';
import { getErrorMessage } from 'src/lib/api';
import {
  createAsignatura,
  deleteAsignatura,
  listAsignaturas,
  updateAsignatura,
} from 'src/lib/asignaturas';
import type { Asignatura } from 'src/types/asignatura';

const Materias = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();
  const isAdmin = user?.rol.name_rol === 'Administrador';

  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const { open, setOpen, editing, openCreate, openEdit } = useModal<Asignatura>();
  const [nombre, setNombre] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadAsignaturas = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setAsignaturas(await listAsignaturas());
    } catch (err) {
      setListError(getErrorMessage(err, 'No se pudo cargar la lista.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAsignaturas();
  }, [loadAsignaturas]);

  // Sincroniza el formulario cuando se abre el modal (crear o editar).
  useEffect(() => {
    if (!open) return;
    setNombre(editing ? editing.name_asignatura : '');
    setFormError(null);
  }, [open, editing]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      if (editing) {
        await updateAsignatura(editing.id_asignatura, { name_asignatura: nombre });
      } else {
        await createAsignatura({ name_asignatura: nombre });
      }
      setOpen(false);
      await loadAsignaturas();
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo guardar la materia.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asignatura: Asignatura) => {
    if (
      !(await confirm({
        title: `Eliminar la materia "${asignatura.name_asignatura}"?`,
        confirmLabel: 'Eliminar',
        destructive: true,
      }))
    )
      return;
    try {
      await deleteAsignatura(asignatura.id_asignatura);
      await loadAsignaturas();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo eliminar.'));
    }
  };

  const columns: Column<Asignatura>[] = [
    {
      key: 'id',
      header: '#',
      render: (a) => <span className="text-muted-foreground">{a.id_asignatura}</span>,
    },
    { key: 'nombre', header: 'Nombre', render: (a) => <span className="font-medium">{a.name_asignatura}</span> },
  ];
  if (isAdmin) {
    columns.push({
      key: 'acc',
      header: 'Acciones',
      align: 'right',
      render: (a) => <RowActions onEdit={() => openEdit(a)} onDelete={() => handleDelete(a)} />,
    });
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <PageHeader
        icon="solar:notebook-bookmark-linear"
        title="Materias"
        description="Catalogo academico de asignaturas conectado al backend."
        action={
          isAdmin && (
            <Button onClick={openCreate} className="md:w-auto w-full">
              <Icon icon="solar:add-circle-linear" width={18} height={18} />
              Nueva materia
            </Button>
          )
        }
      />

      <div className="col-span-12">
        <SectionCard
          title="Listado"
          subtitle={loading ? 'Cargando...' : `${asignaturas.length} materia(s) registrada(s)`}
        >
          {listError ? (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          ) : (
            <CrudTable
              rows={asignaturas}
              getRowKey={(a) => a.id_asignatura}
              loading={loading}
              emptyMessage="No hay materias registradas todavia."
              columns={columns}
            />
          )}
        </SectionCard>
      </div>

      <CrudFormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Editar materia' : 'Nueva materia'}
        error={formError}
        saving={saving}
        onSubmit={handleSubmit}
        className="max-w-md"
      >
        <FormField label="Nombre de la materia" htmlFor="mnombre" required>
          <Input
            id="mnombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Estudios Sociales"
            required
          />
        </FormField>
      </CrudFormDialog>
    </div>
  );
};

export default Materias;
