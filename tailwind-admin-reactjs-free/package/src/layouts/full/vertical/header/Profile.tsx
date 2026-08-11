import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'src/components/ui/dropdown-menu';
import { Button } from 'src/components/ui/button';
import ChangePasswordDialog from 'src/components/account/ChangePasswordDialog';
import { useAuth } from 'src/context/auth-context';

/** Menu de usuario: identidad (rol + correo), cambio de contrasena y logout. */
const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwordOpen, setPasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/inicio');
  };

  const correo = user?.correo_institucional ?? '';
  const rol = user?.rol.name_rol ?? 'Usuario';
  const inicial = (correo.charAt(0) || 'U').toUpperCase();

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-md border border-ld px-3 py-2 hover:bg-lightprimary"
          aria-label="Menu de usuario"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-lightprimary text-sm font-semibold text-primary">
            {inicial}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold">{rol}</span>
            <span className="block max-w-[160px] truncate text-xs text-muted-foreground">
              {correo}
            </span>
          </span>
          <Icon icon="solar:alt-arrow-down-linear" width={16} className="text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[220px] p-2">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold">{rol}</p>
          <p className="truncate text-xs text-muted-foreground">{correo}</p>
        </div>
        <DropdownMenuSeparator />
        <div className="space-y-2 pt-2">
          <Button
            variant="outline"
            className="w-full rounded-md"
            onClick={() => setPasswordOpen(true)}
          >
            <Icon icon="solar:lock-password-linear" width={16} />
            Cambiar contrasena
          </Button>
          <Button variant="outline" className="w-full rounded-md" onClick={handleLogout}>
            <Icon icon="solar:logout-2-linear" width={16} />
            Cerrar sesion
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

    <ChangePasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
};

export default Profile;
