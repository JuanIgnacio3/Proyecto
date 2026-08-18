import { useCallback, useEffect, useState } from 'react';
import {
  Banner,
  CrudTable,
  PageHeader,
  SearchInput,
  SectionCard,
  StatusBadge,
  useConfirm,
  type Column,
} from 'src/components/institutional';
import { Button } from 'src/components/ui/button';
import { useAuth } from 'src/context/auth-context';
import { getErrorMessage } from 'src/lib/api';
import { matchText } from 'src/lib/search';
import { listUsuarios, setUsuarioActivo } from 'src/lib/usuarios';
import type { UsuarioAdmin } from 'src/types/usuario';

const Usuarios = () => {
  const { user } = useAuth();
  const { confirm, notify } = useConfirm();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setListError(null);
    try {
      setUsuarios(await listUsuarios());
    } catch (err) {
      setListError(getErrorMessage(err, 'No se pudo cargar la lista de usuarios.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleActivo = async (u: UsuarioAdmin) => {
    if (u.activo) {
      if (
        !(await confirm({
          title: `Desactivar la cuenta de ${u.nombre_completo}?`,
          confirmLabel: 'Desactivar',
          destructive: true,
        }))
      )
        return;
    }
    try {
      await setUsuarioActivo(u.id_usuario, !u.activo);
      await load();
    } catch (err) {
      await notify(getErrorMessage(err, 'No se pudo actualizar el estado de la cuenta.'));
    }
  };

  const cuentasFiltradas = usuarios.filter((u) =>
    matchText(query, u.nombre_completo, u.correo_institucional, u.tipo, u.rol.name_rol),
  );

  const columns: Column<UsuarioAdmin>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (u) => {
        const esYo = u.id_usuario === user?.id_usuario;
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {u.nombre_completo}
              {esYo && <span className="ml-2 text-xs text-primary">(tu cuenta)</span>}
            </span>
            <span className="text-xs text-muted-foreground">{u.tipo}</span>
          </div>
        );
      },
    },
    {
      key: 'correo',
      header: 'Correo',
      render: (u) => <span className="text-muted-foreground">{u.correo_institucional}</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      // El rol esta atado al tipo de persona (se define al crearla); aqui es de
      // solo lectura. Para cambiar el tipo, se elimina y se recrea en su modulo.
      render: (u) => (
        <span className="rounded-full bg-lightprimary px-3 py-1 text-xs font-medium text-primary">
          {u.rol.name_rol}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (u) => <StatusBadge active={u.activo} />,
    },
    {
      key: 'acc',
      header: 'Acciones',
      align: 'right',
      render: (u) => {
        const esYo = u.id_usuario === user?.id_usuario;
        if (esYo) return <span className="text-xs text-muted-foreground">—</span>;
        return u.activo ? (
          <Button variant="ghosterror" size="sm" onClick={() => handleToggleActivo(u)}>
            Desactivar
          </Button>
        ) : (
          <Button variant="ghostprimary" size="sm" onClick={() => handleToggleActivo(u)}>
            Activar
          </Button>
        );
      },
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      <PageHeader
        icon="solar:shield-user-linear"
        title="Usuarios"
        description="Gestion central de todas las cuentas: activar o desactivar el acceso."
      />

      <div className="col-span-12">
        <SectionCard
          title="Cuentas"
          subtitle={loading ? 'Cargando...' : `${cuentasFiltradas.length} cuenta(s)`}
          actions={
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por nombre, correo, rol..."
            />
          }
        >
          {listError ? (
            <Banner tone="error" className="m-6">
              {listError}
            </Banner>
          ) : (
            <CrudTable
              rows={cuentasFiltradas}
              getRowKey={(u) => u.id_usuario}
              loading={loading}
              emptyMessage="No hay cuentas que coincidan con la busqueda."
              columns={columns}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default Usuarios;
